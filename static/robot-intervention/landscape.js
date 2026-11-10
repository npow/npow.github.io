(async function () {
  const root = document.getElementById('intervention-landscape');
  if (!root) return;
  const el = (tag, text, cls) => { const n=document.createElement(tag); if(text)n.textContent=text;if(cls)n.className=cls;return n; };
  const link=(text,url)=>{const a=el('a',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;};
  const money=c=>c.amount_m==null?'Amount undisclosed':`${c.kind.includes('more than')?'> ':''}${{USD:'$',GBP:'£',EUR:'€',JPY:'¥'}[c.currency]}${c.amount_m.toLocaleString()}M`;
  const categories=[['Connectivity and controls','Make remote control dependable','#b88a43'],['Fleet operations','Own the operating workflow','#5484af'],['Staffed recovery','Deliver work through human operators','#cb7765'],['Developer platforms','Supply infrastructure and training data','#9680c0'],['Integrated robot operations','Own the robot, deployment and fallback','#4d9c83']];
  try {
    const res=await fetch('/robot-intervention/companies.json?v=9');if(!res.ok)throw Error();const data=await res.json();
    root.replaceChildren();
    const header=el('div','','ri-heading');header.append(el('span','RESEARCH DESK · NOVEMBER 10, 2026','ri-eyebrow'),el('h2','Follow the companies'),el('p','Explore the market, then open a company for financing, hiring evidence and a competitive assessment.'));
    const nav=el('div','','ri-nav');nav.setAttribute('aria-label','Research views');
    let view='Landscape';const buttons={};['Landscape','Capital','Hiring'].forEach(v=>{const b=el('button',v);b.type='button';b.onclick=()=>{view=v;render();};buttons[v]=b;nav.append(b);});
    const controls=el('div','','ri-controls');const label=el('label','Search the research');const search=el('input');search.type='search';search.placeholder='Company, job, technology…';label.append(search);
    const cl=el('label','Market layer');const filter=el('select');[['','All layers'],...categories.map(c=>[c[0],c[0]])].forEach(([v,t])=>{const o=el('option',t);o.value=v;filter.append(o);});cl.append(filter);controls.append(label,cl);
    const panel=el('div','','ri-panel');const detail=el('section','','ri-detail');detail.tabIndex=-1;detail.setAttribute('aria-label','Company research');
    const footer=el('p','Selected public evidence, checked November 10, 2026. Missing figures mean unverified, not zero. Job listings show recruiting intent; they do not establish delivered capability.','ri-footnote');
    root.append(header,nav,controls,panel,detail,footer);
    function select(d,scroll=true){
      detail.replaceChildren();const head=el('div','','ri-profile-head');head.append(el('span',d.category,'ri-eyebrow'),el('h3',d.name));
      head.append(d.status_source?link(d.status,d.status_source):el('span',d.status,'ri-tags'));detail.append(head,el('p',d.description));
      const grid=el('div','','ri-profile-grid');const funding=el('div');funding.append(el('h4','Financing · reported'));
      if(d.capital){const c=d.capital;funding.append(link(`${money(c)} · ${c.kind}`,c.url),el('p',c.date,'ri-date'),el('p',c.note));if(c.clarification_url)funding.append(link('Spokesperson clarification ↗',c.clarification_url));}else funding.append(el('p','No financing amount verified in this review.'));
      const hiring=el('div');hiring.append(el('h4','Hiring · observed'));if(d.jobs.length){const ul=el('ul');d.jobs.forEach(j=>{const li=el('li');li.append(link(j.title,j.url));if(j.location)li.append(el('small',j.location));ul.append(li);});hiring.append(ul);}hiring.append(el('p',d.hiring_note,'ri-footnote'));grid.append(funding,hiring);detail.append(grid);
      const a=d.analysis;const assessment=el('div','','ri-assessment');assessment.append(el('span','ASSESSMENT · OUR INTERPRETATION','ri-eyebrow'));
      [['Direction',a.direction],['Potential edge',a.edge],['Competitive pressure',a.risk]].forEach(([h,t])=>{const p=el('p');p.append(el('strong',h+'. '),document.createTextNode(t));assessment.append(p);});
      if(a.peers.length){const peers=el('div','','ri-peers');peers.append(el('span','Compare: '));a.peers.forEach(n=>{const other=data.find(x=>x.name===n);if(other){const b=el('button',n);b.type='button';b.onclick=()=>select(other);peers.append(b);}});assessment.append(peers);}detail.append(assessment);
      const sources=el('div','','ri-sources');sources.append(link('Company / product ↗',d.url));a.sources.forEach((s,i)=>sources.append(link(`Evidence ${i+1} ↗`,s.url)));detail.append(sources);
      if(scroll){detail.scrollIntoView({block:'start',behavior:'smooth'});detail.focus({preventScroll:true});}
    }
    function companyButton(d){const b=el('button',d.name);b.type='button';b.onclick=()=>select(d);return b;}
    function render(){
      Object.entries(buttons).forEach(([v,b])=>b.setAttribute('aria-pressed',String(v===view)));
      const q=search.value.trim().toLowerCase();const visible=data.filter(d=>(!filter.value||filter.value===d.category)&&JSON.stringify([d.name,d.description,d.analysis,d.jobs]).toLowerCase().includes(q));
      panel.replaceChildren();
      if(!visible.length){panel.append(el('p','No matches. Clear the search or choose another layer.'));return;}
      if(view==='Landscape'){
        panel.append(el('p','Grouped by the part of the operation each company sells. Tile sizes do not represent market share.','ri-footnote'));
        const map=el('div','','ri-map');categories.forEach(([c,sub,color])=>{const members=visible.filter(d=>d.category===c);if(!members.length)return;const group=el('section','','ri-group');group.style.setProperty('--ri-color',color);group.append(el('h3',c),el('p',sub,'ri-group-subtitle'));const tiles=el('div','','ri-tiles');members.forEach(d=>{const b=companyButton(d);if(/Acquired|Dissolved/.test(d.status))b.append(el('small',d.status));tiles.append(b);});group.append(tiles);map.append(group);});panel.append(map);
      }else if(view==='Capital'){
        panel.append(el('h3','Disclosed financing, with the dates attached'),el('p','Selected USD rounds—not lifetime funding, valuation, cash on hand or an intervention budget. Older rounds remain dated; a later total may exist.'));
        const excluded=['Waymo','Coco Robotics','FORT Robotics / Mapless AI','FERNRIDE','Remote Robotics','Aurora'];
        const rounds=visible.filter(d=>d.capital?.currency==='USD'&&d.capital.amount_m&&!excluded.includes(d.name)).sort((a,b)=>b.capital.amount_m-a.capital.amount_m);
        const chart=el('div','','ri-chart');rounds.forEach(d=>{const c=d.capital;const row=el('div','','ri-funding-row');row.append(companyButton(d));const track=el('div','','ri-track');const bar=el('div','','ri-bar');bar.style.width=(c.amount_m/170*100)+'%';track.append(bar);const val=el('div','','ri-value');val.append(link(money(c),c.url),el('small',`${c.date} · ${c.kind}`));row.append(track,val);chart.append(row);});panel.append(chart);
        panel.append(el('h4','Different financing structures & currencies'));
        const others=el('div','','ri-capital-notes');visible.filter(d=>d.capital&&!rounds.includes(d)).forEach(d=>{const c=d.capital;const row=el('article');row.append(companyButton(d),link(`${money(c)} · ${c.kind}`,c.url),el('small',c.date),el('p',c.note));others.append(row);});panel.append(others);
        const missing=visible.filter(d=>!d.capital);if(missing.length)panel.append(el('p','No amount verified: '+missing.map(d=>d.name).join(', ')+'.','ri-footnote'));
      }else{
        panel.append(el('h3','What companies are building teams to do'),el('p','Selected live openings. The role is evidence; the product direction below it is an inference. Open a profile to compare competitors.'));
        const jobs=visible.filter(d=>d.jobs.length);if(!jobs.length)panel.append(el('p','No current role verified for this selection.'));
        const grid=el('div','','ri-hiring-grid');jobs.forEach(d=>{const card=el('article','','ri-hiring-card');card.append(el('span',d.jobs[0].signal,'ri-eyebrow'),companyButton(d));const ul=el('ul');d.jobs.forEach(j=>{const li=el('li');li.append(link(j.title,j.url));ul.append(li);});card.append(ul,el('span','DIRECTION · INFERENCE','ri-eyebrow'),el('p',d.analysis.direction));grid.append(card);});panel.append(grid);
      }
    }
    search.oninput=render;filter.onchange=render;render();select(data.find(d=>d.name==='Telexistence'),false);
  }catch(error){root.replaceChildren(el('p','The research explorer could not load.'));root.append(link('Read the research data','/robot-intervention/companies.json'));console.error(error);}
})();
