import json,numpy as np
d=json.load(open('tools/dataset.json'));X=np.array(d['X']);Y=np.array(d['Y'],dtype=float);rng=np.random.default_rng(1)
ix=rng.permutation(len(X));cut=int(len(X)*.85);tr,te=ix[:cut],ix[cut:];F,H=X.shape[1],24
P=[rng.normal(0,.5,(F,H)),np.zeros(H),rng.normal(0,.5,(H,1)),np.zeros(1)];m=[np.zeros_like(p) for p in P];v=[np.zeros_like(p) for p in P]
pw=np.sqrt((1-Y[tr].mean())/max(Y[tr].mean(),1e-6))
def fwd(x):z=x@P[0]+P[1];h=np.maximum(z,0);return z,h,1/(1+np.exp(-(h@P[2]+P[3])[:,0]))
t=0
for ep in range(200):
  for i in range(0,len(tr),256):
    b=tr[i:i+256];x,y=X[b],Y[b];z,h,p=fwd(x);dz=((p-y)*np.where(y==1,pw,1.)/len(b))[:,None];dh=(dz@P[2].T)*(z>0)
    g=[x.T@dh,dh.sum(0),h.T@dz,dz.sum(0)];t+=1
    for k in range(4):m[k]=.9*m[k]+.1*g[k];v[k]=.999*v[k]+.001*g[k]**2;P[k]-=.01*(m[k]/(1-.9**t))/(np.sqrt(v[k]/(1-.999**t))+1e-8)
p=fwd(X[te])[2];y=Y[te];o=np.argsort(p);r=np.empty(len(p));r[o]=np.arange(1,len(p)+1);n1=y.sum();n0=len(y)-n1
print('test AUC %.3f | base rate %.3f | precision in top 20%%: %.3f | positives captured by top 20%%: %.2f'%((r[y==1].sum()-n1*(n1+1)/2)/(n1*n0),y.mean(),y[o[-len(y)//5:]].mean(),y[o[-len(y)//5:]].sum()/n1))
json.dump({'W1':np.round(P[0],4).tolist(),'b1':np.round(P[1],4).tolist(),'W2':np.round(P[2][:,0],4).tolist(),'b2':round(float(P[3][0]),4)},open('model.json','w'))
