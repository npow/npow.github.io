+++
title = "The State of Robotics (September 2026)"
date = 2026-05-31
lastmod = 2026-09-20
draft = false
tags = ["robotics", "physical-ai", "data-analysis", "state-of-the-field"]
description = "A September 2026 census of 2,538 robotics and physical-AI companies across 24 use cases, with funding, hiring, geography, deployment, and an interactive company directory."
summary = "A September 2026 census of 2,538 robotics and physical-AI companies across 24 use cases, with funding, hiring, geography, deployment, and an interactive company directory."
ShowToc = false
+++

A guide to the companies building robots and the software that helps them act in the physical world. This September 2026 census covers **2,538 companies across 24 use-case types**. For each company, it records what it builds, where it is based, disclosed funding, and founding year. The interactive report maps the field, funding, hiring, geography, and where robot AI runs, with a directory of the companies included.

This is a **best-effort census**, not a complete registry. It is more likely to include companies with an English-language web presence; smaller, regional, and stealth companies are undercounted. Most companies do not disclose funding, so funding totals are incomplete and all patterns are directional. This post and its chart update as the census changes. The original May 2026 edition is preserved in [the archive](/robotics/may-2026.html).

The chart below shows companies grouped by the kind of work their robots do. Tile size represents disclosed funding by default; switch to company count with the buttons above it. The [full report](/robotics/) includes funding trends, a May 2026 snapshot of job postings, geography, deployment status, and the company directory.

<style>
.sor-embed{ width:min(94vw,1024px); background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:16px 16px 12px; margin:20px 0 6px; margin-left:50%; transform:translateX(-50%); }
.sor-embed #region-legend{ display:flex; flex-wrap:wrap; gap:12px; font-size:12px; color:#374151; margin:0 0 10px; }
.sor-embed #region-legend .lg{ display:inline-flex; align-items:center; gap:5px; }
.sor-embed #region-legend i{ width:11px; height:11px; border-radius:3px; display:inline-block; }
.sor-embed .sor-tools{ margin:2px 0 12px; }
.sor-embed button{ font:600 12px Helvetica,Arial,sans-serif; padding:6px 12px; margin-right:8px; border:1px solid #c7d2fe; border-radius:6px; cursor:pointer; background:#eef2ff; color:#4f46e5; }
.sor-embed .chart{ width:100%; }
.sor-embed .cap{ font-size:11.5px; color:#9ca3af; font-style:italic; margin:8px 0 0; }
.sor-open{ display:inline-block; font-size:13px; margin:8px 0 0; }
</style>

<div class="sor-embed">
  <div id="region-legend"></div>
  <div class="sor-tools">
    <button id="bt-count" type="button" data-base="font:600 12px Helvetica,Arial,sans-serif;padding:6px 12px;margin-right:8px;border:1px solid #c7d2fe;border-radius:6px;cursor:pointer;">By company (count)</button>
    <button id="bt-fund" type="button" data-base="font:600 12px Helvetica,Arial,sans-serif;padding:6px 12px;margin-right:8px;border:1px solid #c7d2fe;border-radius:6px;cursor:pointer;">By money raised ($)</button>
  </div>
  <div class="chart" id="c-tree"></div>
  <p class="cap" id="tree-cap"></p>
</div>

<p class="sor-open"><a href="/robotics/" target="_blank" rel="noopener">↗ Open the full interactive report</a> — money flows, hiring, geography, deployment, and the full company directory.</p>

<script src="https://cdn.plot.ly/plotly-2.35.2.min.js" charset="utf-8"></script>
<script src="/robotics/data.js"></script>
<script>
(function(){
  var REGION_COLORS={"North America":"#4f46e5","Europe":"#0891b2","China":"#dc2626","Japan & Korea":"#d97706","Other Asia-Pacific":"#16a34a","Middle East":"#9333ea","Latin America":"#db2777","Africa":"#65a30d","Unknown":"#9ca3af"};
  var LAYOUT={font:{family:"Helvetica,Arial,sans-serif",size:12,color:"#374151"},paper_bgcolor:"rgba(0,0,0,0)",plot_bgcolor:"rgba(0,0,0,0)"};
  var CFG={displayModeBar:false,responsive:true};
  var fmtB=function(v){return v>=1000?("$"+(v/1000).toFixed(1)+"B"):("$"+Math.round(v)+"M");};
  var tries=0;
  function start(){
    if(typeof Plotly==="undefined"||typeof DATA==="undefined"){ if(tries++<120){setTimeout(start,60);} return; }
    var cos=DATA.companies;
    function buildTree(mode){try{
      var ids=[],labels=[],parents=[],values=[],colors=[],text=[];
      var segNames=[...new Set(cos.map(function(r){return r.sn;}))];
      var src=mode==="fund"?cos.filter(function(r){return r.f!=null;}):cos;
      segNames.forEach(function(sn){ids.push("S|"+sn);labels.push(sn.replace(/^\d+\.\s*/,""));parents.push("");values.push(0);colors.push("#eef2ff");text.push("");});
      src.forEach(function(r,i){ids.push("C|"+i);labels.push(r.n);parents.push("S|"+r.sn);values.push(mode==="fund"?r.f:1);colors.push(REGION_COLORS[r.r]||"#9ca3af");
        var also=(r.segs&&r.segs.length>1)?("<br>also in: "+r.segs.filter(function(x){return x!==r.sn;}).map(function(x){return x.replace(/^\d+\.\s*/,"");}).join(", ")):"";
        text.push("<b>"+r.n+"</b><br>"+(r.f!=null?fmtB(r.f):"undisclosed")+" \u00b7 "+(r.st||"\u2014")+" \u00b7 "+(r.c||"\u2014")+"<br>"+(r.d||"")+also);});
      Plotly.react("c-tree",[{type:"treemap",ids:ids,labels:labels,parents:parents,values:values,branchvalues:"remainder",marker:{colors:colors,line:{width:0.5,color:"#fff"}},text:text,hovertemplate:"%{text}<extra></extra>",textfont:{size:9},tiling:{packing:"squarify"},pathbar:{visible:true}}],Object.assign({},LAYOUT,{height:560,margin:{l:6,r:6,t:6,b:6}}),CFG);
      document.getElementById("tree-cap").textContent=mode==="fund"
        ? "Tile size = money raised ($ disclosed). Only the ~"+cos.filter(function(r){return r.f!=null;}).length+" companies with a public figure appear here. Color = HQ region; click a use case to zoom."
        : "Each tile = one company (deduplicated), so a use case's area = how many companies it has. Color = HQ region; click to zoom. Flip to the $ view for where capital concentrates.";
      var bc=document.getElementById("bt-count"),bf=document.getElementById("bt-fund");
      bc.style.cssText=bc.dataset.base+(mode==="fund"?"background:#eef2ff;color:#4f46e5":"background:#4f46e5;color:#fff");
      bf.style.cssText=bf.dataset.base+(mode==="fund"?"background:#4f46e5;color:#fff":"background:#eef2ff;color:#4f46e5");
    }catch(e){console.error("tree",e);}}
    document.getElementById("bt-count").addEventListener("click",function(){buildTree("count");});
    document.getElementById("bt-fund").addEventListener("click",function(){buildTree("fund");});
    buildTree("fund");
    var lg=document.getElementById("region-legend");
    if(lg)Object.keys(REGION_COLORS).forEach(function(k){var s=document.createElement("span");s.className="lg";s.innerHTML='<i style="background:'+REGION_COLORS[k]+'"></i>'+k;lg.appendChild(s);});
  }
  start();
})();
</script>

*Single source of truth: the dataset lives in [`/robotics/data.js`](/robotics/data.js) and powers both this chart and the [full interactive report](/robotics/), so they stay in sync.*
