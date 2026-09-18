import hashlib, io, os, re, secrets, time, uuid
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request, Response, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from sqlalchemy import select, delete, text
from sqlalchemy.exc import IntegrityError
from .database import Base, engine, SessionLocal, PracticeSession
from .schemas import CoachRequest, QuestionBatch, Feedback, Fit, ScenarioGrade
from .core import ROLES, QUESTIONS, SCENARIOS, grade, fit, clamp
from .llm import structured

@asynccontextmanager
async def lifespan(app):
    # Reproducible initial schema for this prototype. Adopt migrations before evolving a production DB.
    Base.metadata.create_all(engine)
    yield
app=FastAPI(title='Vaani AI',version='1.0.0',lifespan=lifespan)
allowed=os.environ.get('ALLOWED_ORIGINS','http://localhost:8080,http://localhost:4173').split(',')
app.add_middleware(CORSMiddleware,allow_origins=allowed,allow_credentials=True,allow_methods=['GET','POST'],allow_headers=['Content-Type'])
rate={}
@app.middleware('http')
async def boundaries(request:Request,call_next):
    if int(request.headers.get('content-length','0') or 0)>6*1024*1024:return Response('Request too large',status_code=413)
    origin=request.headers.get('origin')
    if request.method=='POST' and origin and origin not in allowed:return Response('Origin not allowed',status_code=403)
    response=await call_next(request);response.headers['Cache-Control']='no-store';response.headers['X-Content-Type-Options']='nosniff';return response

def owner_for(request,response):
    token=request.cookies.get('vaani_device','')
    if not re.fullmatch(r'[a-f0-9]{64}',token):
        token=secrets.token_hex(32)
        response.set_cookie('vaani_device',token,httponly=True,samesite='strict',secure=os.environ.get('COOKIE_SECURE','false').lower()=='true',max_age=31536000,path='/')
    return hashlib.sha256(token.encode()).hexdigest()

@app.get('/api/health')
def health():
    with engine.connect() as conn: conn.execute(text('SELECT 1'))
    return {'ok':True,'database':engine.dialect.name,'llm_configured':bool(os.environ.get('OPENAI_API_KEY'))}
@app.get('/api/roles')
def roles(): return {'roles':list(ROLES.values()),'mock':True}
@app.post('/api/resume')
async def resume_upload(file:UploadFile=File(...),consent:bool=Form(False)):
    if not consent:raise HTTPException(403,'Consent required before server processing')
    raw=await file.read(5*1024*1024+1)
    if len(raw)>5*1024*1024:raise HTTPException(413,'Choose a file smaller than 5 MB')
    name=(file.filename or '').lower()
    try:
        if name.endswith('.pdf'):
            pdf=PdfReader(io.BytesIO(raw))
            if len(pdf.pages)>10:raise HTTPException(400,'Choose up to 10 pages')
            value='\n'.join(page.extract_text() or '' for page in pdf.pages)
        elif name.endswith(('.txt','.md')):value=raw.decode('utf-8')
        else:raise HTTPException(400,'Use PDF or text')
        if len(value.strip())<20:raise HTTPException(422,'No readable text. Paste text from your resume; scanned PDFs need OCR.')
        return {'text':value[:18000],'stored':False}
    except HTTPException:raise
    except Exception:raise HTTPException(422,'Could not read this file')
    finally:
        raw=b'';await file.close()

@app.post('/api/coach')
async def coach(body:CoachRequest,request:Request,response:Response):
    owner=owner_for(request,response)
    if body.task in ['history','delete-history','save-session']:
        with SessionLocal() as db:
            if body.task=='history':return {'sessions':[s.public() for s in reversed(db.scalars(select(PracticeSession).where(PracticeSession.owner==owner).order_by(PracticeSession.date.desc()).limit(100)).all())]}
            if body.task=='delete-history':db.execute(delete(PracticeSession).where(PracticeSession.owner==owner));db.commit();return {'deleted':True}
            s=body.session
            if not s or s.roleId not in ROLES:raise HTTPException(422,'A valid completed session is required')
            try:uuid.UUID(s.id);datetime.fromisoformat(s.date.replace('Z','+00:00'))
            except ValueError:raise HTTPException(422,'Invalid session identifier or timestamp')
            if s.completed!=(4 if s.mode=='scenario' else 7):raise HTTPException(422,'Complete the session first')
            # Scores are practice self-assessment data, not issued credentials.
            db.add(PracticeSession(id=s.id,owner=owner,role_id=s.roleId,role_title=ROLES[s.roleId]['title'],date=s.date,mode=s.mode,score=s.score,content=s.content,clarity=s.clarity,confidence=s.confidence,completed=s.completed))
            try:db.commit()
            except IntegrityError:db.rollback()
            return {'saved':True}
    if not body.consent:raise HTTPException(403,'Processing consent required')
    role=ROLES.get(body.roleId)
    if not role:raise HTTPException(404,'Unknown role')
    lang=body.lang;schema=None
    if body.task=='questions':
        result=QuestionBatch.model_validate({'questions':QUESTIONS[body.roleId][lang]});schema=QuestionBatch
    elif body.task=='fit':
        if not body.resume or len(body.resume.strip())<20:raise HTTPException(422,'Add a few lines of experience')
        result=fit(body.resume,role,lang);schema=Fit
    elif body.task=='grade':
        if not body.question or not body.answer or len(body.answer.strip())<3:raise HTTPException(422,'Question and answer are required')
        result=grade(body.answer,body.question,role,lang,body.audio);schema=Feedback
    elif body.task=='scenario':
        if body.scenarioIndex is None or body.choice is None:raise HTTPException(422,'Choose a scenario answer')
        s=SCENARIOS[body.scenarioIndex]
        result=ScenarioGrade(score=s['scores'][body.choice],tip=s['tipHi'] if lang=='hi' else s['tip'],source='demo');schema=ScenarioGrade
    now=time.monotonic();count,start=rate.get(owner,(0,now))
    if now-start>60:count,start=0,now
    if len(rate)>5000:rate.clear()
    rate[owner]=(count+1,start)
    source='demo'
    if count<12:
        try:
            payload={**body.model_dump(exclude_none=True),'role':role}
            if body.task=='scenario':payload['scenario']=SCENARIOS[body.scenarioIndex]
            live=await structured(body.task,payload,schema)
            if live:
                result=live;source='llm'
                if body.task=='fit':
                    skills=role['skillsHi'] if lang=='hi' else role['skills'];result.matched=list(dict.fromkeys(s for s in result.matched if s in skills));result.gaps=[s for s in skills if s not in result.matched];result.score=clamp(len(result.matched)/len(skills)*100)
                if body.task=='grade':
                    result.confidence=grade(body.answer,body.question,role,lang,body.audio).confidence
                    result.overall=clamp((result.content+result.clarity)/2 if result.confidence is None else (result.content+result.clarity+result.confidence)/3)
        except Exception:
            # Do not log resumes, answers, provider bodies, or credentials. The labelled demo rubric remains available.
            pass
    if body.task=='questions':return {**result.model_dump(),'source':source}
    return {'result':result.model_dump()}
