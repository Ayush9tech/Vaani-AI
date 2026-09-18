import sectors from '@/data/roles.json';
export type Lang = 'en' | 'hi';
export type Mode = 'text' | 'voice' | 'ivr';
export type Role = {id:string; title:string; titleHi:string; sector:string; sectorHi:string; context:string; contextHi:string; skills:string[]; skillsHi:string[]; location:string; salary:string; experience:string};
const cities=['Lucknow, Uttar Pradesh','Delhi NCR','Jaipur, Rajasthan','Pune, Maharashtra','Gorakhpur, Uttar Pradesh'];
export const roles:Role[]=sectors.flatMap((s,i)=>s.roles.map((r,j)=>({id:`role-${i*5+j+1}`,title:r[0],titleHi:r[1],sector:s.sector,sectorHi:s.sectorHi,context:s.context,contextHi:s.contextHi,skills:s.skills,skillsHi:s.skillsHi,location:cities[j],salary:`₹${12+i+j},000–${17+i+j},000`,experience:j%2?'1–2 years':'0–1 year'})));
export const mockProfile='Asha Verma. Completed Class 12. Six months helping in a family retail shop. Customer service: helped customers choose products and resolved queries. Communication: explained offers clearly in Hindi. Billing: processed cash and UPI payments accurately. Teamwork: worked with two colleagues. Available for full-time work.';
export type Question={id:string;kind:'introduction'|'technical'|'behavioral';text:string;hint:string;model:string};
export function questionsFor(role:Role,lang:Lang):Question[]{
 const hi=lang==='hi', title=hi?role.titleHi:role.title,ctx=hi?role.contextHi:role.context;
 const spec=hi?role.skillsHi:role.skills;
 const prompts=hi?[
 ['introduction',`अपने बारे में बताइए। आप ${title} का काम क्यों करना चाहते हैं?`,'अपना परिचय, एक उपयोगी कौशल और काम करने की वजह बताइए।'],
 ['technical',`इस काम में ${spec[0]} को आप रोज़ कैसे अपनाएँगे?`,'एक काम का उदाहरण और दो व्यावहारिक कदम बताइए।'],
 ['behavioral',`कोई समय बताइए जब आपको ${ctx} जैसी ज़िम्मेदारी मिली। आपने क्या किया?`,'स्थिति → ज़िम्मेदारी → आपका काम → नतीजा। घर या पढ़ाई का उदाहरण भी चलेगा।'],
 ['technical',`जब एक साथ कई काम हों, तो ${title} के रूप में आप किसे पहले करेंगे?`,'सुरक्षा और ज़रूरत के अनुसार प्राथमिकता समझाइए।'],
 ['behavioral','कोई ऐसा समय बताइए जब आपकी टीम में मतभेद हुआ। आपने उसे कैसे सुलझाया?','बताइए कि आपने दूसरे व्यक्ति की बात कैसे सुनी और क्या समाधान निकाला।'],
 ['technical',`${spec[2]} में गलती दिखने पर आप क्या करेंगे?`,'जांच, ज़िम्मेदार व्यक्ति को सूचना और सुधार के कदम बताइए।'],
 ['behavioral','एक समय बताइए जब आपने प्रतिक्रिया लेकर अपना काम बेहतर किया।','पहले क्या दिक्कत थी, आपने क्या बदला, और क्या बेहतर हुआ?']
 ]:[
 ['introduction',`Tell me a little about yourself. What interests you in becoming a ${title}?`,'Share your background, one useful skill, and why this role feels right for you.'],
 ['technical',`How would you use ${spec[0].toLowerCase()} in your day-to-day work?`,'Give a practical example and two specific steps you would take.'],
 ['behavioral',`Tell me about a time you were responsible for ${ctx}, or a similar task.`,'Situation → Task → Action → Result. An example from home or school counts too.'],
 ['technical',`As a ${title}, how would you decide what to do first during a busy shift?`,'Explain how you balance safety, urgency, and the people waiting for help.'],
 ['behavioral','Tell me about a time you disagreed with a teammate. How did you work it out?','Show how you listened, found common ground, and reached a useful outcome.'],
 ['technical',`What would you do if you noticed a mistake involving ${spec[2].toLowerCase()}?`,'Talk through checking the facts, informing the right person, and correcting it.'],
 ['behavioral','Tell me about a time you used feedback to improve your work.','Explain the feedback, what you changed, and how things improved.']
 ];
 const models=hi?[
 `उदाहरण: मैंने अपने रोज़ के अनुभव से ${spec[0]} और ${spec[1]} सीखा है। ${title} में मैं लोगों की मदद और ज़िम्मेदारी से काम करना चाहता/चाहती हूँ। अपने असली अनुभव और रुचि के अनुसार इसे बदलिए।`,
 `उदाहरण: मैं पहले सामने वाले की ज़रूरत सुनूँगा/सुनूँगी। फिर नियमों के अनुसार दो साफ़ विकल्प दूँगा/दूँगी और पूछूँगा/पूछूँगी कि अगला कदम समझ आया या नहीं। इससे ${spec[0]} व्यवहार में दिखता है।`,
 `उदाहरण: एक व्यस्त दिन में मुझे ${ctx} की ज़िम्मेदारी मिली। मैंने पहले ज़रूरत समझी, ${spec[0]} पर ध्यान दिया और साथी से काम बाँटा। काम समय पर पूरा हुआ। अपना असली नतीजा जोड़ें।`,
 `उदाहरण: पहले किसी सुरक्षा जोखिम को संभालूँगा/संभालूँगी। फिर ज़रूरी काम और इंतज़ार कर रहे लोगों को प्राथमिकता दूँगा/दूँगी। साथी से मदद और देरी के बारे में स्पष्ट जानकारी दूँगा/दूँगी।`,
 `उदाहरण: एक टीम के काम में हमारी प्राथमिकताओं पर मतभेद था। मुझे काम समय पर पूरा करना था। मैंने साथी की बात सुनी, अपना कारण बताया और मिलकर काम बाँटा। नतीजे में काम बिना देरी पूरा हुआ। अपने अनुभव से बदलें।`,
 `उदाहरण: ${spec[2]} में गलती दिखे तो पहले तथ्य जांचूँगा/जांचूँगी, सुरक्षित ढंग से काम रोकूँगा/रोकूँगी और ज़िम्मेदार व्यक्ति को बताऊँगा/बताऊँगी। अपने अधिकार में सुधार करके आगे ऐसी गलती रोकने का तरीका तय करूँगा/करूँगी।`,
 `उदाहरण: किसी साथी ने बताया कि मेरे निर्देश साफ़ नहीं थे। मुझे बेहतर बातचीत करनी थी। मैंने एक उदाहरण पूछा, निर्देश छोटे कदमों में दिए और समझ की पुष्टि की। इससे दोबारा पूछना कम हुआ। केवल अपना असली अनुभव बताइए।`
 ]:[
 `Example to adapt: My everyday experience has helped me practise ${role.skills[0].toLowerCase()} and ${role.skills[1].toLowerCase()}. I am interested in the ${role.title} role because I enjoy helping people and taking responsibility. Add one real experience and your own reason for choosing this work.`,
 `Example to adapt: I would first understand what is needed, check the relevant guidance, and explain two practical next steps. I would check that the person understood and ask a colleague when unsure. This makes ${role.skills[0].toLowerCase()} visible in my daily work.`,
 `Example to adapt: During a busy shift, I was responsible for ${role.context}. I checked the need, used ${role.skills[0].toLowerCase()}, and agreed the next steps with a teammate. We completed the task on time. Replace this with your own situation and real outcome.`,
 `Example to adapt: I would deal with any immediate safety issue first, then prioritise urgent tasks and people who are waiting. I would agree responsibilities with my teammate and explain any delay. I would still check accuracy before completing the work.`,
 `Example to adapt: During a team task, we disagreed about priorities. I needed to help finish on time. I listened to my teammate, explained my concern, and suggested dividing the work. We agreed a plan and completed the task without delay. Use a real example from your life.`,
 `Example to adapt: If I noticed a mistake involving ${role.skills[2].toLowerCase()}, I would check the facts and pause any unsafe action. I would inform the responsible person, make only corrections I am authorised to make, and agree how to prevent it happening again.`,
 `Example to adapt: A teammate told me my instructions were unclear. I needed to communicate better, so I asked for an example, broke instructions into shorter steps, and checked understanding. We had fewer repeated questions afterward. Share your own feedback, action and outcome.`
 ];
 return prompts.map((p,i)=>({id:`q${i+1}`,kind:p[0] as Question['kind'],text:p[1],hint:p[2],model:models[i]}));
}
export type AudioMetrics={duration:number;wpm:number;pauses:number;pitchVariance:number|null;voicedFrames:number;fillerCount:number};
export type Feedback={content:number;clarity:number;confidence:number|null;overall:number;tip:string;strength:string;model:string;star:{situation:boolean;task:boolean;action:boolean;result:boolean};source:'demo'|'llm';audio?:AudioMetrics};
const clamp=(n:number)=>Math.max(0,Math.min(100,Math.round(n)));
export function gradeAnswer(answer:string,q:Question,role:Role,lang:Lang,audio?:AudioMetrics):Feedback{
 const words=answer.trim().split(/\s+/).length, lower=answer.toLowerCase();
 const star={situation:/when|during|once|at my|last |जब|एक बार|दौरान/.test(lower),task:/responsib|needed|had to|task|goal|ज़िम्मेदारी|जिम्मेदारी|करना था|ज़रूरत|जरूरत/.test(lower),action:/\bi\b|मैंने|हमने/.test(lower)&&/help|check|ask|listen|explain|made|did|organis|inform|मदद|जांच|पूछ|सुन|समझ|किया|बाँट/.test(lower),result:/result|finally|improv|complet|happy|resolved|learn|समय पर|नतीज|पूरा|बेहतर|सीख|समाधान/.test(lower)};
 const tokens=role.skills.flatMap(s=>s.toLowerCase().split(' ')).concat(role.skillsHi),hits=tokens.filter(t=>lower.includes(t)).length;
 const content=clamp(25+Math.min(30,words*.5)+Math.min(25,hits*6)+(q.kind==='behavioral'?Object.values(star).filter(Boolean).length*5:Math.min(20,words*.3)));
 const clarity=clamp(35+Math.min(35,words*.6)+(answer.match(/[.!?।]/g)?.length?12:0)+(words>=30&&words<=150?12:0)-(audio?.fillerCount||0)*2);
 const confidence=audio&&audio.voicedFrames>=12&&audio.duration>=8?clamp(78-Math.max(0,audio.pauses-2)*4-Math.abs(audio.wpm-125)*.15+(audio.pitchVariance&&audio.pitchVariance>10?6:0)):null;
 const score=confidence===null?(content+clarity)/2:(content+clarity+confidence)/3;
 const tip=lang==='hi'?(words<25?'अगली बार एक असली उदाहरण जोड़िए: आपने क्या किया और उससे क्या बदला?':!star.result?'अच्छी शुरुआत! अंत में नतीजा जोड़िए—जैसे काम समय पर हुआ या ग्राहक की समस्या हल हुई।':'अगली बार यही जवाब लगभग एक मिनट में बोलने का अभ्यास कीजिए।'):(words<25?'For your next rep, add one real example: what did you do, and what changed?':!star.result?'A good start! Add the outcome at the end—perhaps a problem solved or a task completed on time.':'For your next rep, practise this answer in about a minute, keeping your own action and result clear.');
 return {content,clarity,confidence,overall:clamp(score),tip,strength:lang==='hi'?'आपने अभ्यास के लिए पहला कदम लिया। अपने अनुभव को अपनी आवाज़ में बताना आपकी ताकत है।':hits?'You connected your answer to the role. Keep building on that practical experience.':'You put your experience into words. That is a useful step toward your next interview.',model:q.model,star,source:'demo',...(audio?{audio}:{})};
}
export type Fit={score:number;matched:string[];gaps:string[];tip:string;source:'demo'|'llm'};
export function jobFit(text:string,role:Role,lang:Lang):Fit{
 const l=text.toLowerCase();const aliases:Record<string,string[]>={'Customer service':['customer','ग्राहक'],'Communication':['communicat','बातचीत','hindi','हिंदी'],'Billing':['billing','cash','upi','बिलिंग'],'Stock management':['stock','inventory','स्टॉक'],'Teamwork':['team','colleagu','टीम','साथी'],'Hygiene':['clean','hygiene','सफाई'],'Safety':['safe','सुरक्षा']};
 const matches=role.skills.map((s,i)=>(aliases[s]||[s.toLowerCase(),role.skillsHi[i]]).some(t=>l.includes(t)));
 const skills=lang==='hi'?role.skillsHi:role.skills;
 return {score:Math.round(matches.filter(Boolean).length/role.skills.length*100),matched:skills.filter((_,i)=>matches[i]),gaps:skills.filter((_,i)=>!matches[i]),tip:lang==='hi'?'यह घोषित कौशलों का अभ्यास-मिलान है। इंटरव्यू में अपने असली अनुभव बताइए।':'This compares declared skills, not hiring eligibility. Add real examples for skills you already use.',source:'demo'};
}
export type Session={id:string;roleId:string;roleTitle:string;date:string;mode:Mode|'scenario';score:number;content:number;clarity:number;confidence:number|null;completed:number;demo?:boolean};
export function sampleSessions():Session[]{return [64,72,80].map((score,i)=>({id:`sample-${i}`,roleId:'role-1',roleTitle:'Retail Sales Associate',date:new Date(Date.now()-(3-i)*86400000).toISOString(),mode:i===1?'voice':'text',score,content:score-2,clarity:score+3,confidence:i===1?score-1:null,completed:7,demo:true}));}
export function readiness(sessions:Session[],roleId?:string){const scoped=sessions.filter(s=>s.mode!=='scenario'&&s.completed===7&&(!roleId||s.roleId===roleId));const real=scoped.filter(s=>!s.demo);const set=(real.length?real:scoped).slice(-3);return {score:set.length?Math.round(set.reduce((a,b)=>a+b.score,0)/set.length):0,eligible:real.length>=3&&real.slice(-3).every(s=>s.score>=75),count:real.length,sample:!real.length&&!!set.length};}
export function streak(sessions:Session[]){const days=new Set(sessions.map(s=>new Date(s.date).toLocaleDateString('en-CA')));let n=0,d=new Date();if(!days.has(d.toLocaleDateString('en-CA')))d.setDate(d.getDate()-1);while(days.has(d.toLocaleDateString('en-CA'))){n++;d.setDate(d.getDate()-1);}return n;}
export const scenarioBank=[
 {title:'An upset customer',titleHi:'नाराज़ ग्राहक',question:'A customer says they were charged twice and starts raising their voice. What do you do first?',questionHi:'एक ग्राहक कहता है कि उनसे दो बार पैसे लिए गए और वे नाराज़ हैं। सबसे पहले क्या करेंगे?',options:['Ask them to calm down and wait.','Listen, acknowledge their concern, and check the transaction.','Promise a refund without checking.'],optionsHi:['उन्हें शांत होकर इंतज़ार करने को कहेंगे।','बात सुनेंगे, परेशानी समझेंगे और भुगतान की जांच करेंगे।','बिना जांच के पैसे वापस देने का वादा करेंगे।'],scores:[35,95,50],tip:'Acknowledge the concern before solving it. Check the facts and explain what happens next.',tipHi:'पहले उनकी परेशानी समझिए, फिर तथ्य जांचिए और अगला कदम बताइए।',skill:'Empathy',skillHi:'सहानुभूति'},
 {title:'A teammate needs a hand',titleHi:'साथी को मदद चाहिए',question:'You have finished your work, but a new teammate is struggling to meet a deadline. What is your next step?',questionHi:'आपका काम पूरा है, लेकिन नया साथी समय पर काम पूरा नहीं कर पा रहा। अगला कदम क्या होगा?',options:['Leave; your own work is finished.','Take over everything without asking.','Ask what help they need and agree a plan together.'],optionsHi:['अपना काम पूरा है, चले जाएंगे।','बिना पूछे पूरा काम खुद करेंगे।','उनकी ज़रूरत पूछेंगे और मिलकर योजना बनाएंगे।'],scores:[25,55,95],tip:'Offer support without taking away ownership. A shared plan makes the whole team stronger.',tipHi:'साथी की ज़िम्मेदारी छीने बिना मदद कीजिए। मिलकर योजना बनाना टीम को मज़बूत करता है।',skill:'Teamwork',skillHi:'टीमवर्क'},
 {title:'Safety comes first',titleHi:'सुरक्षा सबसे पहले',question:'You notice a spill near a busy walkway. You are already late for a task. What do you do?',questionHi:'व्यस्त रास्ते में कुछ गिरा है। आपके काम में पहले ही देर हो रही है। आप क्या करेंगे?',options:['Make the area safe and alert the responsible person.','Walk around it and continue.','Wait for someone else to notice.'],optionsHi:['जगह सुरक्षित करेंगे और ज़िम्मेदार व्यक्ति को बताएंगे।','बचकर आगे चले जाएंगे।','किसी और के ध्यान देने का इंतज़ार करेंगे।'],scores:[95,30,20],tip:'Prevent immediate harm, then communicate the delay. Safety is a shared responsibility.',tipHi:'पहले नुकसान रोकिए, फिर देरी की सूचना दीजिए। सुरक्षा सबकी ज़िम्मेदारी है।',skill:'Judgment',skillHi:'निर्णय क्षमता'},
 {title:'Receiving feedback',titleHi:'प्रतिक्रिया स्वीकार करना',question:'Your supervisor suggests a different way to do a task. How do you respond?',questionHi:'पर्यवेक्षक काम करने का अलग तरीका बताते हैं। आपकी प्रतिक्रिया क्या होगी?',options:['Explain that your way is always better.','Ask for an example, try it, and check your progress.','Agree but keep doing it the same way.'],optionsHi:['कहेंगे कि आपका तरीका हमेशा बेहतर है।','उदाहरण पूछेंगे, तरीका आज़माएंगे और सुधार जांचेंगे।','हाँ कहेंगे, लेकिन पुराना तरीका ही अपनाएंगे।'],scores:[25,95,35],tip:'Curiosity turns feedback into progress. Ask one specific question and try the new approach.',tipHi:'जिज्ञासा से सीखना आसान होता है। एक स्पष्ट सवाल पूछिए और नया तरीका आज़माइए।',skill:'Adaptability',skillHi:'अनुकूलन क्षमता'}
];
