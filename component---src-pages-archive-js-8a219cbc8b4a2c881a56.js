"use strict";(self.webpackChunkportfolio=self.webpackChunkportfolio||[]).push([[527],{2087:function(e,t,a){var r=a(7854),l=a(9781),n=a(7045),i=a(7066),d=a(7293),o=r.RegExp,c=o.prototype;l&&d((function(){var e=!0;try{o(".","d")}catch(d){e=!1}var t={},a="",r=e?"dgimsy":"gimsy",l=function(e,r){Object.defineProperty(t,e,{get:function(){return a+=r,!0}})},n={dotAll:"s",global:"g",ignoreCase:"i",multiline:"m",sticky:"y"};for(var i in e&&(n.hasIndices="d"),n)l(i,n[i]);return Object.getOwnPropertyDescriptor(c,"flags").get.call(t)!==r||a!==r}))&&n(c,"flags",{configurable:!0,get:i})},5790:function(e,t,a){a.r(t);var r=a(7294),l=a(5186),n=a(96),i=a(448),d=a(4880),o=a(7786),c=a(6603),s=a(550);const m=n.default.div.withConfig({displayName:"archive__StyledTableContainer",componentId:"sc-1shh8jg-0"})(["margin:100px -20px;@media (max-width:768px){margin:50px -10px;}table{width:100%;border-collapse:collapse;.hide-on-mobile{@media (max-width:768px){display:none;}}tbody tr{&:hover,&:focus{background-color:var(--light-navy);}}th,td{padding:10px;text-align:left;&:first-child{padding-left:20px;@media (max-width:768px){padding-left:10px;}}&:last-child{padding-right:20px;@media (max-width:768px){padding-right:10px;}}svg{width:20px;height:20px;}}tr{cursor:default;td:first-child{border-top-left-radius:var(--border-radius);border-bottom-left-radius:var(--border-radius);}td:last-child{border-top-right-radius:var(--border-radius);border-bottom-right-radius:var(--border-radius);}}td{&.year{padding-right:20px;@media (max-width:768px){padding-right:10px;font-size:var(--fz-sm);}}&.title{padding-top:15px;padding-right:20px;color:var(--lightest-slate);font-size:var(--fz-xl);font-weight:600;line-height:1.25;}&.company{font-size:var(--fz-lg);white-space:nowrap;}&.tech{font-size:var(--fz-xxs);font-family:var(--font-mono);line-height:1.5;.separator{margin:0 5px;}span{display:inline-block;}}&.links{min-width:100px;div{display:flex;align-items:center;a{",";flex-shrink:0;}a + a{margin-left:10px;}}}}}"],(e=>{let{theme:t}=e;return t.mixins.flexCenter}));t.default=e=>{let{location:t,data:a}=e;const n=a.allMarkdownRemark.edges,h=(0,r.useRef)(null),p=(0,r.useRef)(null),g=(0,r.useRef)([]),f=(0,s.Tb)();return(0,r.useEffect)((()=>{f||(d.Z.reveal(h.current,(0,i.srConfig)()),d.Z.reveal(p.current,(0,i.srConfig)(200,0)),g.current.forEach(((e,t)=>d.Z.reveal(e,(0,i.srConfig)(10*t)))))}),[]),r.createElement(o.Ar,{location:t},r.createElement(l.q,{title:"Archive"}),r.createElement("main",null,r.createElement("header",{ref:h},r.createElement("h1",{className:"big-heading"},"Archive"),r.createElement("p",{className:"subtitle"},"A big list of things I’ve worked on")),r.createElement(m,{ref:p},r.createElement("table",null,r.createElement("thead",null,r.createElement("tr",null,r.createElement("th",null,"Year"),r.createElement("th",null,"Title"),r.createElement("th",{className:"hide-on-mobile"},"Made at"),r.createElement("th",{className:"hide-on-mobile"},"Built with"),r.createElement("th",null,"Link"))),r.createElement("tbody",null,n.length>0&&n.map(((e,t)=>{let{node:a}=e;const{date:l,github:n,external:i,android:d,title:o,tech:s,company:m}=a.frontmatter;return r.createElement("tr",{key:t,ref:e=>g.current[t]=e},r.createElement("td",{className:"overline year"},""+new Date(l).getFullYear()),r.createElement("td",{className:"title"},o),r.createElement("td",{className:"company hide-on-mobile"},m?r.createElement("span",null,m):r.createElement("span",null,"—")),r.createElement("td",{className:"tech hide-on-mobile"},(null==s?void 0:s.length)>0&&s.map(((e,t)=>r.createElement("span",{key:t},e,"",t!==s.length-1&&r.createElement("span",{className:"separator"},"·"))))),r.createElement("td",{className:"links"},r.createElement("div",null,i&&r.createElement("a",{href:i,"aria-label":"External Link"},r.createElement(c.JO,{name:"External"})),n&&r.createElement("a",{href:n,"aria-label":"GitHub Link"},r.createElement(c.JO,{name:"GitHub"})))))})))))))}}}]);
//# sourceMappingURL=component---src-pages-archive-js-8a219cbc8b4a2c881a56.js.map