import json,urllib.request,http.cookiejar
jar=http.cookiejar.CookieJar();opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
def request(path,data=None):
 body=json.dumps(data).encode() if data is not None else None
 req=urllib.request.Request('https://ossomosso.com'+path,data=body,headers={'Content-Type':'application/json','Accept':'application/json','User-Agent':'Ossomosso campaign verification','Origin':'https://ossomosso.com'})
 with opener.open(req,timeout=30) as r:return json.load(r)
items=[{'id':57603928588620,'quantity':1},{'id':58923679777100,'quantity':1},{'id':58237374366028,'quantity':1},{'id':59782137741644,'quantity':1},{'id':59791062958412,'quantity':1}]
try:
 request('/cart/add.js',{'items':items})
 c=request('/cart.js')
 result={'currency':c['currency'],'original':c['original_total_price'],'total':c['total_price'],'discount':c['total_discount'],'items':[{'id':i['variant_id'],'title':i['product_title'],'base':i['original_price'],'final':i['final_price'],'discounts':[a['discount_application']['title'] for a in i.get('line_level_discount_allocations',[])]} for i in c['items']]}
 print(json.dumps(result,ensure_ascii=False,indent=2))
 assert c['total_price']==20495, 'Mixed cart must total 204.95 EUR'
 assert sorted(i['final_price'] for i in c['items'])==[1000,3825,3850,3920,7900]
 request('/cart/update.js',{'discount':'WELCOMEHOME10'})
 after=request('/cart.js')
 print(json.dumps({'with_welcome_code':after['total_price'],'expected_no_stacking':20495}))
 assert after['total_price']==20495, 'WELCOMEHOME10 must not stack with BF'
finally:
 try: request('/cart/clear.js',{})
 except Exception: pass
