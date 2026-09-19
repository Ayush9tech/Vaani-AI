from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

Score = Annotated[int, Field(ge=0, le=100)]
class StrictModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
class Question(StrictModel):
    id: str = Field(max_length=20)
    kind: Literal['introduction', 'technical', 'behavioral']
    text: str = Field(min_length=8, max_length=700)
    hint: str = Field(max_length=500)
    model: str = Field(max_length=1600)
class QuestionBatch(StrictModel):
    questions: list[Question] = Field(min_length=7, max_length=7)
class Star(StrictModel):
    situation: bool
    task: bool
    action: bool
    result: bool
class Feedback(StrictModel):
    content: Score
    clarity: Score
    confidence: Score | None
    overall: Score
    tip: str = Field(min_length=10, max_length=600)
    strength: str = Field(min_length=5, max_length=600)
    model: str = Field(max_length=1600)
    star: Star
    source: Literal['demo', 'llm']
class Fit(StrictModel):
    score: Score
    matched: list[str] = Field(max_length=12)
    gaps: list[str] = Field(max_length=12)
    tip: str = Field(min_length=10, max_length=600)
    source: Literal['demo', 'llm']
class ScenarioGrade(StrictModel):
    score: Score
    tip: str = Field(min_length=10, max_length=600)
    source: Literal['demo', 'llm']
class AudioMetrics(StrictModel):
    duration: float = Field(ge=0, le=1800)
    wpm: int = Field(ge=0, le=3000)
    pauses: int = Field(ge=0, le=2000)
    pitchVariance: float | None = Field(ge=0, le=1_000_000)
    voicedFrames: int = Field(ge=0, le=20000)
    fillerCount: int = Field(ge=0, le=3000)
class SessionScore(StrictModel):
    id: str
    roleId: str = Field(max_length=40)
    roleTitle: str = Field(max_length=100)
    date: str
    mode: Literal['text', 'voice', 'ivr', 'scenario']
    score: Score
    content: Score
    clarity: Score
    confidence: Score | None
    completed: int = Field(ge=1, le=7)
class CoachRequest(StrictModel):
    task: Literal['questions', 'fit', 'grade', 'scenario', 'save-session', 'history', 'delete-history']
    roleId: str | None = None
    lang: Literal['en', 'hi'] = 'en'
    consent: bool = False
    resume: str | None = Field(default=None, max_length=18000)
    question: Question | None = None
    answer: str | None = Field(default=None, max_length=6000)
    audio: AudioMetrics | None = None
    scenarioIndex: int | None = Field(default=None, ge=0, le=3)
    choice: int | None = Field(default=None, ge=0, le=2)
    explanation: str | None = Field(default=None, max_length=2000)
    session: SessionScore | None = None
