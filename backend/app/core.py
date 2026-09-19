"""Explicit demo rubric; never represented as a trained or validated assessment."""
import json
import math
import os
import re
from pathlib import Path

from .schemas import Feedback, Fit, Star

DATA = Path(os.environ.get('DATA_DIR', str(Path(__file__).resolve().parents[2] / 'data')))
ROLES = {r['id']: r for r in json.loads((DATA/'role-records.json').read_text())}
QUESTIONS = json.loads((DATA/'question-banks.json').read_text())
SCENARIOS = json.loads((DATA/'scenarios.json').read_text())
def clamp(n): return max(0, min(100, math.floor(n + .5)))
def fit(resume, role, lang):
    text = resume.lower()
    aliases = {'Customer service':['customer','ग्राहक'], 'Communication':['communicat','बातचीत','hindi','हिंदी'], 'Billing':['billing','cash','upi','बिलिंग'], 'Stock management':['stock','inventory','स्टॉक'], 'Teamwork':['team','colleagu','टीम','साथी'], 'Hygiene':['clean','hygiene','सफाई'], 'Safety':['safe','सुरक्षा']}
    flags = [any(a in text for a in aliases.get(skill, [skill.lower(), role['skillsHi'][i]])) for i,skill in enumerate(role['skills'])]
    skills = role['skillsHi'] if lang == 'hi' else role['skills']
    return Fit(score=clamp(sum(flags)/len(flags)*100),matched=[s for s,f in zip(skills,flags) if f],gaps=[s for s,f in zip(skills,flags) if not f],tip='यह घोषित कौशलों का अभ्यास-मिलान है। अपने असली अनुभव के उदाहरण जोड़िए।' if lang=='hi' else 'This compares declared skills, not hiring eligibility. Add real examples for the skills you already use.',source='demo')
def grade(answer, question, role, lang, audio=None):
    lower=answer.lower(); words=len(answer.split())
    star=Star(situation=bool(re.search(r'when|during|once|at my|last |जब|एक बार|दौरान',lower)),task=bool(re.search(r'responsib|needed|had to|task|goal|ज़िम्मेदारी|जिम्मेदारी|करना था|ज़रूरत|जरूरत',lower)),action=bool(re.search(r'\bi\b|मैंने|हमने',lower) and re.search(r'help|check|ask|listen|explain|made|did|organis|inform|मदद|जांच|पूछ|सुन|समझ|किया|बाँट',lower)),result=bool(re.search(r'result|finally|improv|complet|happy|resolved|learn|समय पर|नतीज|पूरा|बेहतर|सीख|समाधान',lower)))
    tokens=' '.join(role['skills']).lower().split()+role['skillsHi'];hits=sum(t in lower for t in tokens)
    content=clamp(25+min(30,words*.5)+min(25,hits*6)+(sum(star.model_dump().values())*5 if question.kind=='behavioral' else min(20,words*.3)))
    clarity=clamp(35+min(35,words*.6)+(12 if re.search(r'[.!?।]',answer) else 0)+(12 if 30<=words<=150 else 0)-(audio.fillerCount if audio else 0)*2)
    confidence=None
    if audio and audio.voicedFrames>=12 and audio.duration>=8:
        confidence=clamp(78-max(0,audio.pauses-2)*4-abs(audio.wpm-125)*.15+(6 if audio.pitchVariance and audio.pitchVariance>10 else 0))
    overall=clamp((content+clarity)/2 if confidence is None else (content+clarity+confidence)/3)
    if lang=='hi':
        tip='अगली बार एक असली उदाहरण जोड़िए: आपने क्या किया और उससे क्या बदला?' if words<25 else 'अंत में नतीजा जोड़िए—जैसे काम समय पर हुआ या समस्या हल हुई।' if not star.result else 'अगली बार यही जवाब लगभग एक मिनट में बोलने का अभ्यास कीजिए।'
        strength='आपने अपने अनुभव को शब्द दिए। अगले अभ्यास में इसी शुरुआत को और मज़बूत करें।'
    else:
        tip='For your next rep, add one real example: what did you do, and what changed?' if words<25 else 'Add the outcome at the end—perhaps a problem solved or a task completed on time.' if not star.result else 'For your next rep, practise this answer in about a minute, keeping your own action and result clear.'
        strength='You connected your answer to the role. Keep building on that experience.' if hits else 'You put your experience into words. That is a useful step toward your next interview.'
    return Feedback(content=content,clarity=clarity,confidence=confidence,overall=overall,tip=tip,strength=strength,model=question.model,star=star,source='demo')
