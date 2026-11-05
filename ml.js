(function(g){const S=640,M=34,R=13,SR=16,P=[[M,M],[S-M,M],[M,S-M],[S-M,S-M]],cl=v=>Math.min(3,v);
function feat(W,side,sx,vx,vy){const y=side==='w'?S-M-48:M+48,sp=Math.sqrt(vx*vx+vy*vy)||1,ux=vx/sp,uy=vy/sp;let bo=null,bp=null,no=0,nq=0;
 for(const c of W){if(c.out||c.t==='s')continue;const own=c.t===side||c.t==='q';own?no++:nq++;const fx=c.x-sx,fy=c.y-y,pr=fx*ux+fy*uy;if(pr<0)continue;
  const pp=Math.sqrt(Math.max(0,fx*fx+fy*fy-pr*pr));if(own){if(!bo||pp<bo.p)bo={p:pp,t:pr,c}}else if(!bp||pp<bp.p)bp={p:pp,t:pr}}
 let al=-1,pd=1,bpn=3,bt=1;if(bo){bpn=cl(bo.p/40);bt=bo.t/S;const gt=bo.t-Math.sqrt(Math.max(0,(R+SR)**2-bo.p**2)),gx=sx+ux*gt,gy=y+uy*gt,nx=bo.c.x-gx,ny=bo.c.y-gy,nl=Math.sqrt(nx*nx+ny*ny)||1;
  for(const q of P){const qx=q[0]-bo.c.x,qy=q[1]-bo.c.y,ql=Math.sqrt(qx*qx+qy*qy)||1,a=(nx*qx+ny*qy)/(nl*ql);if(a>al){al=a;pd=ql/S}}}
 return[sx/S,ux,uy,sp/12,bpn,bt,bp?cl(bp.p/40):3,bp?bp.t/S:1,al,pd,no/10,nq/10]}
const ML={ready:false,feat,set(m){ML.m=m;ML.ready=true},predict(f){const m=ML.m;let o=m.b2;for(let j=0;j<m.b1.length;j++){let s=m.b1[j];for(let i=0;i<f.length;i++)s+=f[i]*m.W1[i][j];if(s>0)o+=s*m.W2[j]}return 1/(1+Math.exp(-o))}};
g.ML=ML})(typeof window!=='undefined'?window:globalThis);
