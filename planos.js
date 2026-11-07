import {jsPDF} from 'https://cdn.jsdelivr.net/npm/jspdf@4.2.1/+esm';

const ink='#233543', muted='#506677', accent='#126b61', rule='#c6d3dc', pale='#eef3f6';
const format=new Intl.NumberFormat('es-MX',{maximumFractionDigits:2});
const cm=value=>format.format(value)+' cm';
const pair=(a,b)=>format.format(a)+' × '+cm(b);

export function createPlans(p,hardware,views=[]){
 const pdf=new jsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true});
 pdf.setProperties({title:'Buzón de paquetes - planos y despieces',subject:'Configuración actual del simulador Buzón 3D'});
 const w=p.openingW,h=p.openingH,f=p.frameW,outerW=w+2*p.cabinetWallThickness;

 function text(value,x,y,{size=10,color=ink,bold=false,align='left',angle=0}={}){
  pdf.setFont('helvetica',bold?'bold':'normal');
  pdf.setFontSize(size);
  pdf.setTextColor(color);
  pdf.text(value,x,y,{align,angle});
 }
 function paragraph(value,x,y,width,size=9){
  pdf.setFont('helvetica','normal');pdf.setFontSize(size);
  text(pdf.splitTextToSize(value,width),x,y,{size,color:muted});
 }
 function line(x1,y1,x2,y2,color=ink,width=.28){
  pdf.setDrawColor(color);pdf.setLineWidth(width);pdf.line(x1,y1,x2,y2);
 }
 function rect(x,y,width,height,fill='#ffffff',stroke=rule){
  pdf.setFillColor(fill);pdf.setDrawColor(stroke);pdf.setLineWidth(.28);
  pdf.rect(x,y,width,height,'FD');
 }
 function circle(x,y,r,fill=ink,stroke=ink){
  pdf.setFillColor(fill);pdf.setDrawColor(stroke);pdf.setLineWidth(.25);
  pdf.circle(x,y,r,'FD');
 }
 function polygon(points,fill,stroke=ink){
  const [[x,y],...rest]=points;
  const steps=rest.map(([u,v],i)=>[u-points[i][0],v-points[i][1]]);
  pdf.setFillColor(fill);pdf.setDrawColor(stroke);pdf.setLineWidth(.35);
  pdf.lines(steps,x,y,[1,1],'FD',true);
 }
 function header(number,title,description){
  if(number>1)pdf.addPage();
  text('BUZÓN 3D  /  PLANOS DE REFERENCIA',14,13,{size:9,color:accent,bold:true});
  text(title,14,26,{size:22,bold:true});
  text(description,14,34,{size:10,color:muted});
  line(14,40,283,40,rule);
  line(14,195,283,195,rule);
  text('Cotas en centímetros. Verificar montaje, tolerancias y anclajes antes de fabricar.',14,201,{size:8,color:muted});
  text(String(number).padStart(2,'0')+' / '+String(5+views.length).padStart(2,'0'),283,201,{size:9,color:accent,bold:true,align:'right'});
 }
 function panel(x,y,width,height,title){
  rect(x,y,width,height,'#ffffff');
  text(title,x+6,y+8,{size:11,bold:true});
 }
 function dimH(a,b,y,anchor,label){
  line(a,anchor,a,y+1.4,accent,.18);line(b,anchor,b,y+1.4,accent,.18);
  line(a,y,b,y,accent,.23);
  for(const x of [a,b])line(x-.9,y+.9,x+.9,y-.9,accent,.23);
  text(label,(a+b)/2,y-1.9,{size:8.2,color:accent,align:'center'});
 }
 function dimV(a,b,x,anchor,label){
  line(anchor,a,x+1.4,a,accent,.18);line(anchor,b,x+1.4,b,accent,.18);
  line(x,a,x,b,accent,.23);
  for(const y of [a,b])line(x-.9,y+.9,x+.9,y-.9,accent,.23);
  pdf.setFont('helvetica','normal');pdf.setFontSize(8.2);
  const halfLabel=pdf.getTextWidth(label)/2;
  text(label,x-2.1,(a+b)/2+halfLabel,{size:8.2,color:accent,angle:90});
 }
 function badge(value,x,y){
  circle(x,y,2.65,accent);
  text(String(value),x,y+.9,{size:8,color:'#ffffff',bold:true,align:'center'});
 }
 function table(x,y,columns,rows,rowHeight=8){
  const width=columns.reduce((sum,column)=>sum+column[1],0);
  rect(x,y,width,8,pale);
  let left=x;
  for(const [label,span] of columns){
   text(label,left+3,y+5.3,{size:8.5,bold:true});
   left+=span;
  }
  rows.forEach((row,index)=>{
   const top=y+8+index*rowHeight;
   if(index%2===1)rect(x,top,width,rowHeight,'#f8fafb','#f8fafb');
   line(x,top+rowHeight,x+width,top+rowHeight,rule,.18);
   left=x;
   row.forEach((value,col)=>{
    text(value,left+3,top+rowHeight*.66,{size:8.7});
    left+=columns[col][1];
   });
  });
 }

 header(1,'Alzados del buzón','Fachada desde la calle y puerta de recogida desde la casa.');
 panel(14,47,132,138,'01A  Fachada');
 panel(151,47,132,138,'01B  Vista desde la casa');
 {
  const scale=Math.min(90/(w+2*f+20),84/(p.boxTop+8));
  const ground=161,high=ground-(p.entryY+h)*scale,low=ground-p.entryY*scale;
  const left=78-w*scale/2,right=78+w*scale/2;
  rect(left-(f+8)*scale,high-(f+5)*scale,(w+2*f+16)*scale,ground-high+(f+5)*scale,pale);
  rect(left-f*scale,high-f*scale,(w+2*f)*scale,(h+2*f)*scale,'#657582',ink);
  rect(left,high,w*scale,h*scale,'#ffffff',ink);
  rect(left+p.gap*scale,high+p.gap*scale,p.lidW*scale,p.lidH*scale,'#bac8d0',ink);
  line(28,ground,131,ground,muted);
  dimH(left,right,high-f*scale-4,high,'Ancho '+cm(w));
  dimV(high,low,right+f*scale+9,right,'Alto '+cm(h));
  dimV(low,ground,left-f*scale-9,left,'Entrada '+cm(p.entryY));
  text('Marco perimetral en ambas caras del muro.',20,177,{size:8.4,color:muted});

  const scaleB=Math.min(88/(outerW+16),92/p.boxTop),cx=215;
  const x1=cx-outerW*scaleB/2,x2=cx+outerW*scaleB/2;
  const top=ground-p.boxTop*scaleB,base=ground-p.boxFloor*scaleB;
  rect(x1,top,outerW*scaleB,p.boxH*scaleB,'#dce5eb',ink);
  rect(x1+scaleB,top+scaleB,(outerW-2)*scaleB,(p.boxH-2)*scaleB,'#f5f8f9',muted);
  for(const y of [top+14,base-14])rect(x1-1,y-2.6,2,5.2,'#748793',muted);
  circle(x2-5,(top+base)/2,1.65);
  for(const x of [x1+7*scaleB,x2-7*scaleB]){
   const r=p.wheelD*scaleB/2;
   line(x,base,x,ground-r);
   circle(x,ground-r,r);
  }
  line(164,ground,270,ground,muted);
  dimV(top,ground,x2+11,x2,'Total '+cm(p.boxTop));
  dimH(x1,x2,171,base,'Ancho exterior '+cm(outerW));
 }

 header(2,'Corte lateral y planta','Posición del depósito acoplado. El borde superior del marco interior alinea con el techo.');
 panel(14,47,132,138,'02A  Corte lateral');
 panel(151,47,132,138,'02B  Planta');
 {
  const span=p.wallD+p.dockingGap+p.boxD;
  const scale=Math.min(91/span,84/(p.boxTop+10));
  const x=79-span*scale/2,wall=x+p.wallD*scale,cab=wall+p.dockingGap*scale,right=cab+p.boxD*scale;
  const ground=156,y=value=>ground-value*scale;
  rect(x,y(p.boxTop+8),p.wallD*scale,(p.boxTop+8)*scale,pale,muted);
  rect(x,y(p.entryY+h),p.wallD*scale,h*scale,'#ffffff',muted);
  for(const edge of [x,wall]) {
   line(edge,y(p.entryY+h+f),edge,y(p.entryY+h),ink,.65);
   line(edge,y(p.entryY),edge,y(p.entryY-f),ink,.65);
  }
  rect(cab,y(p.boxTop),p.boxD*scale,p.boxH*scale,'#dce5eb',ink);
  line(cab+p.cabinetWallThickness*scale,y(p.boxTop-p.cabinetWallThickness),right,y(p.boxTop-p.cabinetWallThickness),muted);
  line(x,y(p.boxTop),right,y(p.boxTop),accent,.24);
  const hingeX=wall-1.3*scale,hingeY=y(p.entryY+1.2);
  line(hingeX,hingeY-p.lidH*scale,hingeX,hingeY+p.tongueL*scale,ink,.8);
  circle(hingeX,hingeY,1,'#a66e35');
  for(const wheel of [cab+7*scale,right-7*scale]){
   const r=p.wheelD*scale/2;
   line(wheel,y(p.boxFloor),wheel,ground-r);
   circle(wheel,ground-r,r);
  }
  line(22,ground,138,ground,muted);
  dimH(x,wall,166,ground,'Muro '+cm(p.wallD));
  dimH(cab,right,166,ground,'Fondo '+cm(p.boxD));
  dimH(x,right,176,166,'Fondo acoplado '+cm(span));
  dimV(y(p.boxTop),ground,right+10,right,'Total '+cm(p.boxTop));

  const s=Math.min(91/(outerW+16),82/span),px=217-outerW*s/2,py=66;
  const wallEnd=py+p.wallD*s,boxStart=wallEnd+p.dockingGap*s,boxEnd=boxStart+p.boxD*s;
  rect(px-8,py,outerW*s+16,p.wallD*s,pale,muted);
  rect(px+p.cabinetWallThickness*s,py,w*s,p.wallD*s,'#ffffff',muted);
  rect(px,boxStart,outerW*s,p.boxD*s,'#dce5eb',ink);
  rect(px+p.cabinetWallThickness*s,boxStart,w*s,(p.boxD-p.cabinetWallThickness)*s,'#ffffff',muted);
  line(px,boxEnd,px+outerW*s,boxEnd,ink,.65);
  dimH(px+p.cabinetWallThickness*s,px+outerW*s-p.cabinetWallThickness*s,boxEnd+12,boxEnd,'Ancho interior '+cm(w));
  paragraph('Separación nominal entre el muro y el depósito acoplado de '+cm(p.dockingGap)+'.',157,174,116);
 }

 header(3,'Despiece del conjunto fijo','Orden de las piezas de calle a casa. Medidas nominales del modelo.');
 panel(14,47,85,80,'03A  Marco exterior');
 panel(106,47,85,80,'03B  Tapa, pestaña y eje');
 panel(198,47,85,80,'03C  Marco interior');
 {
  const s=Math.min(59/(w+2*f),53/(h+2*f+p.tongueL));
  for(const [cx,inside] of [[56.5,false],[240.5,true]]){
   const x=cx-(w+2*f)*s/2,y=63;
   rect(x,y,(w+2*f)*s,(h+2*f)*s,'#8a9ba6',ink);
   rect(x+f*s,y+f*s,w*s,h*s,'#ffffff',ink);
   if(inside){
    const latch=y+(f+p.entryY+h-p.latchY)*s;
    for(const px of [x+f*s-1.6,x+(w+f)*s])rect(px,latch-1.5,1.6,3,'#d5e3e8',accent);
   }
   dimH(x,x+(w+2*f)*s,115,y+(h+2*f)*s,pair(w+2*f,h+2*f));
  }
  const cx=148.5,y=63,axis=y+p.lidH*s;
  rect(cx-p.lidW*s/2,y,p.lidW*s,p.lidH*s,'#bac8d0',ink);
  rect(cx-p.tongueW*s/2,axis,p.tongueW*s,p.tongueL*s,'#e1e9ee',ink);
  line(cx-p.tongueW*s/2,axis,cx+p.tongueW*s/2,axis,'#a66e35',1.1);
  text('Conjunto basculante',cx,120,{size:8,color:muted,align:'center'});
  for(const x of [99,191]){
   line(x+.7,88,x+5.7,88,accent,.5);
   line(x+4.2,86.7,x+5.7,88,accent,.5);line(x+4.2,89.3,x+5.7,88,accent,.5);
  }
  table(14,135,[['Pieza o conjunto',70],['Cantidad',26],['Medida nominal',173]],[
   ['Marco de ambas caras','2 remates',pair(w+2*f,h+2*f)+' exteriores · espesor '+cm(p.frameThickness)],
   ['Cantos y apoyo del muro','1 juego','Abertura '+pair(w,h)+' · canto a lo largo del muro de '+cm(p.wallD)],
   ['Tapa exterior','1',pair(p.lidW,p.lidH)+' · holgura perimetral '+cm(p.gap)],
   ['Pestaña solidaria','1',pair(p.tongueW,p.tongueL)+' · espesor '+cm(p.tongueT)],
   ['Eje compartido y soportes','1 conjunto','Largo del eje '+cm(p.tongueW)]
  ],8.4);
 }

 header(4,'Despiece del depósito móvil','Piezas separadas para identificar su posición. Gabinete, puerta, ruedas y herrajes.');
 panel(14,47,164,138,'04A  Vista axonométrica separada');
 panel(184,47,99,138,'04B  Piezas principales');
 {
  const bw=outerW,bh=p.boxH,d=p.boxD,g=Math.max(bw,d,bh)*.17;
  const panelPieces=[
   {id:2,points:[[-bw/2-g,0,0],[-bw/2-g,0,d],[-bw/2-g,bh,d],[-bw/2-g,bh,0]],fill:'#ccd9e1'},
   {id:3,points:[[-bw/2,-g,0],[bw/2,-g,0],[bw/2,-g,d],[-bw/2,-g,d]],fill:'#d3e0e6'},
   {id:1,points:[[-bw/2,bh+g,0],[bw/2,bh+g,0],[bw/2,bh+g,d],[-bw/2,bh+g,d]],fill:'#b7cbd5'},
   {id:2,points:[[bw/2+g,0,0],[bw/2+g,0,d],[bw/2+g,bh,d],[bw/2+g,bh,0]],fill:'#ccd9e1'},
   {id:4,points:[[-bw/2+1,1,d+g*1.7],[bw/2-1,1,d+g*1.7],[bw/2-1,bh-1,d+g*1.7],[-bw/2+1,bh-1,d+g*1.7]],fill:'#e8f0f3'}
  ];
  const project=([x,y,z])=>[.88*x-.62*z,-y+.21*x+.33*z];
  const projected=panelPieces.map(piece=>({...piece,points:piece.points.map(project)}));
  const door=projected.at(-1);
  const cabinetLeft=Math.min(...projected.slice(0,-1).flatMap(piece=>piece.points.map(point=>point[0])));
  const doorShift=cabinetLeft-17-Math.max(...door.points.map(point=>point[0]));
  door.points=door.points.map(([x,y])=>[x+doorShift,y]);

  const floor=projected.find(piece=>piece.id===3);
  const floorBottom=Math.max(...floor.points.map(point=>point[1]));
  const wheels=[];
  for(const x of [-bw/2+7,bw/2-7])for(const z of [7,d-7])wheels.push(project([x,0,z]));
  const wheelShift=floorBottom+14-Math.min(...wheels.map(point=>point[1]));
  const separatedWheels=wheels.map(([x,y])=>[x,y+wheelShift]);
  const points=[...projected.flatMap(piece=>piece.points),...separatedWheels];
  const minX=Math.min(...points.map(q=>q[0])),maxX=Math.max(...points.map(q=>q[0]));
  const minY=Math.min(...points.map(q=>q[1])),maxY=Math.max(...points.map(q=>q[1]));
  const s=Math.min(143/(maxX-minX),106/(maxY-minY));
  const place=([x,y])=>[96+(x-(minX+maxX)/2)*s,66+(y-minY)*s];
  for(const piece of projected){
   const poly=piece.points.map(place);
   polygon(poly,piece.fill);
   const average=axis=>poly.reduce((sum,q)=>sum+q[axis],0)/poly.length;
   badge(piece.id,average(0),average(1));
  }
  const [lockX,lockY]=project([bw/2-7,bh/2,d+g*1.7]);
  const lock=place([lockX+doorShift,lockY]);
  circle(...lock,1.05);
  for(const wheel of separatedWheels){const [x,y]=place(wheel);circle(x,y,2.1);}
  const [wx,wy]=place(separatedWheels[3]);badge(5,wx+7,wy+2);
  const parts=[
   ['Techo',pair(bw,d)],
   ['Laterales (2)',pair(d,bh)],
   ['Piso',pair(bw,d)],
   ['Puerta de recogida',pair(bw-2,bh-2)],
   ['Rodajas (4)',cm(p.wheelD)+' de diámetro']
  ];
  parts.forEach(([name,value],i)=>{
   const y=68+i*18;
   badge(i+1,193,y-1.4);
   text(name,199,y,{size:10,bold:true});
   text(value,199,y+5,{size:9,color:muted});
  });
  paragraph('La cerradura y las bisagras se montan en la puerta. Los cierres laterales llevan su receptor en el marco fijo.',190,163,86);
 }

 header(5,'Medidas y herrajes','Resumen de la configuración exportada y referencias de compra.');
 panel(14,47,129,138,'05A  Medidas del modelo');
 panel(150,47,133,138,'05B  Piezas comerciales');
 {
  table(20,62,[['Medida',84],['Valor',33]],[
   ['Abertura (ancho × alto)',pair(w,h)],
   ['Altura del borde inferior de entrada',cm(p.entryY)],
   ['Espesor del muro',cm(p.wallD)],
   ['Ancho visible del marco',cm(f)],
   ['Espesor de ambos remates',cm(p.frameThickness)],
   ['Depósito (ancho interior × profundidad)',pair(w,p.boxD)],
   ['Altura del cuerpo del depósito',cm(p.boxH)],
   ['Altura de montaje de las ruedas',cm(p.boxFloor)],
   ['Altura total con ruedas',cm(p.boxTop)],
   ['Altura de los cierres laterales',cm(p.latchY)]
  ],9.7);
  hardware.forEach(({part,qty,ref,url},i)=>{
   const y=66+i*27;
   text(part,156,y,{size:10,bold:true});
   text(qty+' - '+ref,156,y+6,{size:8.5,color:muted});
   text('Abrir ficha técnica PDF',156,y+12,{size:8.5,color:accent});
   pdf.link(156,y+8,39,5,{url});
   if(i<hardware.length-1)line(156,y+16,277,y+16,rule,.2);
  });
 }
 const viewSheets=[
  {
   title:'Vista 3D exterior',
   description:'Perspectiva desde la calle con el depósito acoplado y el muro en transparencia.',
   imageTitle:'06A  Marco y abertura',
   notes:'La altura de entrada se mide desde el piso hasta el borde inferior de la abertura.',
   measures:[['Ancho de abertura',w],['Alto de abertura',h],['Altura de entrada',p.entryY],['Espesor del muro',p.wallD]]
  },
  {
   title:'Vista 3D interior',
   description:'Perspectiva desde la casa con la puerta de recogida cerrada y las ruedas apoyadas en el piso.',
   imageTitle:'07A  Depósito y ruedas',
   notes:'La altura total incluye las ruedas. La profundidad corresponde al cuerpo del depósito.',
   measures:[['Ancho interior',w],['Profundidad',p.boxD],['Altura total',p.boxTop],['Altura del cuerpo',p.boxH],['Diámetro de rueda',p.wheelD]]
  },
  {
   title:'Vista 3D del mecanismo',
   description:'Perspectiva de la tapa abierta, la pestaña interior y el eje compartido.',
   imageTitle:'08A  Conjunto fijo con tapa abierta',
   notes:'La tapa y la pestaña giran juntas sobre el eje que las une al marco.',
   measures:[['Alto de tapa',p.lidH],['Largo de pestaña',p.tongueL],['Ancho de pestaña',p.tongueW],['Longitud del eje',p.tongueW],['Espesor de pestaña',p.tongueT]]
  }
 ];
 views.forEach((image,i)=>{
  const view=viewSheets[i];
  header(6+i,view.title,view.description);
  panel(14,47,199,138,view.imageTitle);
  pdf.addImage(image,'PNG',18,59,191,122,undefined,'FAST');
  panel(219,47,64,138,'Cotas principales');
  view.measures.forEach(([label,value],j)=>{
   const y=67+j*16;
   text(label,225,y,{size:9.5,color:muted});
   text(cm(value),225,y+5,{size:12,bold:true});
  });
  paragraph(view.notes,225,155,52,8.5);
  text('Perspectiva sin escala.',225,177,{size:8.5,color:accent,bold:true});
 });
 return pdf.output('blob');
}
