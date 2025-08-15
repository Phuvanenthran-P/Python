/* Simple SPA with hash routing, localStorage progress, lessons, quizzes, and a basic code playground.
   NOTE: Code execution is stubbed. To enable, integrate Skulpt/Pyodide and replace runCode(). */

const $ = sel => document.querySelector(sel);
const app = $("#app");

const store = {
  get(k, def){ try { return JSON.parse(localStorage.getItem(k)) ?? def } catch { return def; } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
};

const progress = store.get('progress', { lessonsDone: {}, quizScores: {}, streak: 0, lastDaily: null });

function saveProgress(){ store.set('progress', progress); }

function route(){
  const hash = location.hash || '#/';
  const [_, path, a, b] = hash.split('/');
  if (!path) return renderHome();
  if (path === '') return renderHome();
  if (path === 'modules') return renderModules();
  if (path === 'lesson') return renderLesson(a,b);
  if (path === 'quiz') return renderQuiz(a,b);
  if (path === 'progress') return renderProgress();
  if (path === 'daily') return renderDaily();
  if (path === 'playground') return renderPlayground();
  renderNotFound();
}

function renderHome(){
  app.innerHTML = `
    <section class="card">
      <h2>Welcome</h2>
      <p>Master Python from scratch through short lessons, hands-on practice, and quizzes. Your progress is saved locally.</p>
      <div><a class="btn" href="#/modules">Start Learning</a></div>
      <p><small class="muted">Tip: Press <span class="kbd">Ctrl</span> + <span class="kbd">/</span> for the Playground.</small></p>
    </section>
    <section class="card">
      <h3>Modules</h3>
      <div class="grid cols-3">${window.CURRICULUM.map(m => `
        <div class="card">
          <h4>${m.title}</h4>
          <p>${m.description}</p>
          <a class="btn" href="#/modules">View</a>
        </div>`).join('')}</div>
    </section>
  `;
}

function renderModules(){
  app.innerHTML = `<h2>Modules</h2>` + window.CURRICULUM.map(m => `
    <section class="card">
      <h3>${m.title}</h3>
      <p>${m.description}</p>
      <div class="grid cols-2">
        ${m.lessons.map(ls => `
          <div class="card">
            <h4>${ls.title}</h4>
            <p>${ls.content.split('\n')[0]}</p>
            <a class="btn" href="#/lesson/${m.id}/${ls.id}">Open Lesson</a>
            <a class="btn" href="#/quiz/${m.id}:${ls.id}">Quiz</a>
            ${doneBadge(m.id, ls.id)}
          </div>
        `).join('')}
      </div>
    </section>
  `).join('');
}

function doneBadge(mid,lid){
  const key = `${mid}:${lid}`;
  const done = !!progress.lessonsDone[key];
  const score = progress.quizScores[key];
  return `<div style="margin-top:8px">
    ${done ? '<span class="badge">Lesson ✓</span>' : ''}
    ${score!=null ? `<span class="badge">Quiz: ${score}%</span>` : ''}
  </div>`;
}

function renderLesson(mid,lid){
  const mod = window.CURRICULUM.find(m => m.id===mid);
  const lesson = mod.lessons.find(l => l.id===lid);
  app.innerHTML = `
    <div class="card">
      <a href="#/modules">← Back</a>
      <h2>${mod.title} — ${lesson.title}</h2>
      <div class="card"><pre class="code">${lesson.content}</pre></div>
      <h3>Example</h3>
      <div class="card"><pre class="code">${lesson.example}</pre></div>
      <div>
        <button class="btn" id="mark-done">Mark Lesson Done</button>
        <a class="btn" href="#/quiz/${mid}:${lid}">Take Quiz</a>
        <a class="btn" href="#/playground">Open in Playground</a>
      </div>
    </div>
  `;
  $("#mark-done").onclick = () => {
    progress.lessonsDone[`${mid}:${lid}`] = true;
    saveProgress();
    alert('Marked done.');
    route();
  };
}

function renderQuiz(keyA,keyB){
  // Support both '#/quiz/module:lesson' or '#/quiz/module/lesson'
  const key = keyB ? `${keyA}:${keyB}` : keyA;
  const quiz = window.QUIZZES[key];
  if (!quiz) { app.innerHTML = `<div class="card"><p>No quiz found.</p></div>`; return; }
  app.innerHTML = `
    <div class="card">
      <a href="#/modules">← Back</a>
      <h2>${quiz.title}</h2>
      <form id="quiz-form">
        ${quiz.items.map((it,idx)=>`
          <div class="card">
            <p><strong>Q${idx+1}.</strong> ${it.q}</p>
            ${it.options.map((op,i)=>`
              <label style="display:block;margin:6px 0;">
                <input type="radio" name="q${idx}" value="${i}" required /> ${op}
              </label>
            `).join('')}
          </div>
        `).join('')}
        <button class="btn" type="submit">Submit</button>
      </form>
      <div id="quiz-result"></div>
    </div>
  `;
  $("#quiz-form").onsubmit = (e)=>{
    e.preventDefault();
    const data = new FormData(e.target);
    let correct=0;
    quiz.items.forEach((it,idx)=>{
      const v = parseInt(data.get(`q${idx}`),10);
      if (v===it.a) correct++;
    });
    const score = Math.round(100*correct/quiz.items.length);
    progress.quizScores[key] = score;
    saveProgress();
    $("#quiz-result").innerHTML = `<p>Score: <strong>${score}%</strong></p>`;
  };
}

function renderProgress(){
  const done = Object.keys(progress.lessonsDone).length;
  const total = window.CURRICULUM.reduce((s,m)=>s+m.lessons.length,0);
  const pct = total? Math.round(100*done/total) : 0;
  app.innerHTML = `
    <section class="card">
      <h2>Your Progress</h2>
      <div class="progress"><div style="width:${pct}%"></div></div>
      <p>${done}/${total} lessons done (${pct}%).</p>
      <div>
        <button class="btn" id="export">Export Progress</button>
        <button class="btn" id="import">Import Progress</button>
        <button class="btn" id="reset">Reset</button>
      </div>
      <div class="card"><small class="muted">Quizzes: ${Object.keys(progress.quizScores).length}</small></div>
    </section>
  `;
  $("#export").onclick = ()=>{
    const blob = new Blob([JSON.stringify(progress,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'learnpy-progress.json'; a.click();
    URL.revokeObjectURL(url);
  };
  $("#import").onclick = ()=>{
    const inp = document.createElement('input');
    inp.type='file'; inp.accept='application/json';
    inp.onchange = ()=>{
      const f = inp.files[0];
      const reader = new FileReader();
      reader.onload = ()=>{
        try {
          const data = JSON.parse(reader.result);
          Object.assign(progress, data);
          saveProgress();
          alert('Progress imported.');
          route();
        } catch(e){ alert('Invalid file.'); }
      };
      reader.readAsText(f);
    };
    inp.click();
  };
  $("#reset").onclick = ()=>{
    if (confirm('Reset all progress?')){
      progress.lessonsDone={}; progress.quizScores={}; progress.streak=0; progress.lastDaily=null;
      saveProgress(); route();
    }
  };
}

function renderDaily(){
  const today = new Date().toISOString().slice(0,10);
  let message = '';
  if (progress.lastDaily !== today) {
    progress.streak = (progress.lastDaily && ((new Date(today)-new Date(progress.lastDaily))===86400000)) ? (progress.streak+1) : (progress.streak?1:1);
    progress.lastDaily = today;
    saveProgress();
    message = 'New challenge unlocked!';
  } else {
    message = 'You already claimed today’s challenge.';
  }
  const challenge = `Write a function is_prime(n) that returns True if n is prime.`;
  app.innerHTML = `
    <section class="card">
      <h2>Daily Challenge</h2>
      <p>${challenge}</p>
      <p>Streak: <strong>${progress.streak}</strong> days</p>
      <a class="btn" href="#/playground">Solve in Playground</a>
      <p><small class="muted">${message}</small></p>
    </section>
  `;
}

function renderPlayground(){
  app.innerHTML = `
    <section class="card">
      <h2>Playground</h2>
      <p>Run code here. Execution engine is stubbed for now. (Integrate Skulpt/Pyodide to execute.)</p>
      <textarea id="code" rows="12" class="input">print("Hello from the Playground!")</textarea>
      <div style="margin-top:8px">
        <button class="btn" id="run">Run</button>
        <button class="btn" id="copy">Copy</button>
      </div>
      <div id="output" class="card"><pre class="code">[output will appear here]</pre></div>
    </section>
  `;
  $("#run").onclick = ()=> runCode($("#code").value);
  $("#copy").onclick = ()=> { navigator.clipboard.writeText($("#code").value); alert('Copied.'); };
}

function runCode(src){
  // Stub: Replace with Skulpt/Pyodide integration later.
  const out = `Execution engine not yet enabled.\n\nYour code:\n${src}`;
  $("#output").innerHTML = `<pre class="code">${out.replace(/</g,'&lt;')}</pre>`;
}

function renderNotFound(){ app.innerHTML = `<div class="card"><p>Not found.</p></div>`; }

window.addEventListener('hashchange', route);
window.addEventListener('keydown', (e)=>{
  if (e.ctrlKey && e.key === '/') location.hash = '#/playground';
});
route();
