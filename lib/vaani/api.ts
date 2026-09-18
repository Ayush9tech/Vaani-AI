export async function coachRequest(task:string,payload:Record<string,unknown>){
 const response=await fetch('/api/coach',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({task,...payload}),signal:AbortSignal.timeout(18000)});
 if(!response.ok)throw new Error('Coaching service unavailable');return response.json() as Promise<{result?:any;questions?:any[];source?:string;sessions?:any[];saved?:boolean;deleted?:boolean;notice?:string}>;
}
