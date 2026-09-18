import os, tempfile, uuid
os.environ['DATABASE_URL']='sqlite:///'+tempfile.mktemp(prefix='vaani-tests-',suffix='.db')
os.environ.pop('OPENAI_API_KEY',None)
from fastapi.testclient import TestClient
from app.main import app
from app.database import PracticeSession

def test_catalog_and_bilingual_questions():
    with TestClient(app) as client:
        roles=client.get('/api/roles').json()['roles'];assert len(roles)==40
        for lang in ['en','hi']:
            r=client.post('/api/coach',json={'task':'questions','roleId':'role-1','lang':lang,'consent':True})
            assert r.status_code==200;assert len(r.json()['questions'])==7
            assert any(q['kind']=='behavioral' for q in r.json()['questions'])
        assert client.post('/api/coach',json={'task':'questions','roleId':'role-1'}).status_code==403

def test_fit_and_text_grading_do_not_invent_audio():
    with TestClient(app) as c:
        profile='Customer service, communication in Hindi, billing with cash and UPI.'
        r=c.post('/api/coach',json={'task':'fit','roleId':'role-1','resume':profile,'consent':True}).json()['result']
        assert r['score']==75;assert r['gaps']==['Stock management']
        q=c.post('/api/coach',json={'task':'questions','roleId':'role-1','consent':True}).json()['questions'][0]
        body={'task':'grade','roleId':'role-1','question':q,'answer':'During a busy day at my shop, I had to help a customer. I checked the billing and explained the payment. As a result, the issue was resolved and the customer was happy.','consent':True}
        r=c.post('/api/coach',json=body);assert r.status_code==200
        result=r.json()['result'];assert result['confidence'] is None;assert 0<=result['overall']<=100;assert len(result['tip'])>20
        body['audio']={'duration':1,'wpm':180,'pauses':0,'pitchVariance':10,'voicedFrames':5,'fillerCount':0}
        assert c.post('/api/coach',json=body).json()['result']['confidence'] is None
        body['audio']['duration']=-1
        assert c.post('/api/coach',json=body).status_code==422

def test_isolated_durable_scores_and_delete():
    with TestClient(app) as a,TestClient(app) as b:
        session={'id':str(uuid.uuid4()),'roleId':'role-1','roleTitle':'Retail Sales Associate','date':'2026-09-18T10:00:00Z','mode':'text','score':80,'content':78,'clarity':82,'confidence':None,'completed':7}
        assert a.post('/api/coach',json={'task':'save-session','session':session}).status_code==200
        assert a.post('/api/coach',json={'task':'save-session','session':session}).status_code==200
        assert len(a.post('/api/coach',json={'task':'history'}).json()['sessions'])==1
        assert b.post('/api/coach',json={'task':'history'}).json()['sessions']==[]
        assert a.post('/api/coach',json={'task':'delete-history'}).json()['deleted']
        assert a.post('/api/coach',json={'task':'history'}).json()['sessions']==[]
        columns=set(PracticeSession.__table__.columns.keys())
        assert not columns.intersection({'answer','resume','transcript','audio','recording'})

def test_validation_and_upload_privacy():
    with TestClient(app) as c:
        r=c.post('/api/resume',files={'file':('resume.txt',b'Customer service and communication experience in a retail shop.')},data={'consent':'false'});assert r.status_code==403
        r=c.post('/api/resume',files={'file':('resume.txt',b'Customer service and communication experience in a retail shop.')},data={'consent':'true'});assert r.status_code==200;assert not r.json()['stored']
        assert c.post('/api/coach',json={'task':'scenario','roleId':'role-1','scenarioIndex':9,'choice':0,'consent':True}).status_code==422
        assert c.post('/api/coach',json={'task':'scenario','roleId':'role-1','scenarioIndex':0,'choice':1,'consent':True}).json()['result']['score']==95
        assert c.post('/api/coach',headers={'Origin':'https://untrusted.example'},json={'task':'history'}).status_code==403
