from pathlib import Path
import math, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'assets/video'
SPRITES = ROOT/'assets/sprites'
W,H,FPS,SECONDS = 1280,720,30,5
rng=np.random.default_rng(51)
y,x=np.mgrid[0:H,0:W]
top=np.array([225,234,222]); bottom=np.array([249,237,210])
ratio=(y/H)[...,None]
arr=top*(1-ratio)+bottom*ratio
glow=np.exp(-((x-W*.5)**2/(420**2)+(y-300)**2/(300**2)))[...,None]
arr=arr*(1-glow*.45)+np.array([255,250,224])*glow*.45
arr+=rng.normal(0,.65,(H,W,1))
background=Image.fromarray(np.clip(arr,0,255).astype('uint8')).convert('RGBA')
d=ImageDraw.Draw(background)
# Long, softly layered paper hills.
for base,amplitude,color,phase in [(445,58,(185,204,185,255),.2),(511,39,(205,210,180,255),2.1),(590,23,(226,212,169,255),.7)]:
    points=[(xx,int(base+amplitude*math.sin(xx/W*math.pi*2+phase))) for xx in range(-10,W+11,5)]
    d.polygon(points+[(W,H),(0,H)],fill=color)
d.ellipse((492,260,788,556),fill=(242,222,164,100))
d.line([(50,637),(320,644),(650,638),(950,645),(1230,635)],fill=(157,145,111,130),width=2)
d.rounded_rectangle((24,24,W-25,H-25),radius=20,outline=(169,148,101,110),width=1)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf',94)
small=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',16)
tiny=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',13)

def ease(v):
    v=max(0,min(1,v));return 1-(1-v)**3
def tracked(draw,text,center,y,font,spacing,fill):
    widths=[draw.textlength(c,font=font) for c in text]
    xx=center-(sum(widths)+spacing*(len(text)-1))/2
    for c,width in zip(text,widths):
        draw.text((xx,y),c,font=font,fill=fill);xx+=width+spacing

# Each image is used intact; movement never invents or changes the design.
roster=[('spear_bowl',148,224,0),('sword_tall',319,241,.5),
        ('blue_king',518,330,.15),('red_king',763,330,.4),
        ('spear_cone',970,233,.75),('sword_blue',1134,222,1)]
units=[]
for key,cx,height,phase in roster:
    im=Image.open(SPRITES/(key+'-hd.webp')).convert('RGBA')
    im=im.resize((round(im.width*height/im.height),height),Image.Resampling.LANCZOS)
    units.append((im,cx,phase))
particles=[]
palette=[(185,144,63),(78,118,137),(184,99,74),(240,214,142),(126,151,117)]
for i in range(145):
    particles.append((rng.uniform(35,W-35),rng.uniform(-400,-15),rng.uniform(75,165),rng.uniform(3,8),rng.uniform(0,6.28),palette[i%5]))

def frame(t):
    canvas=background.copy();layer=Image.new('RGBA',(W,H));p=ImageDraw.Draw(layer)
    # Fluttering standards frame the procession.
    for bx,color,direction in [(70,(70,113,137),1),(1210,(176,92,70),-1)]:
        p.line((bx,350,bx,610),fill=(125,108,77,160),width=3)
        sway=5*math.sin(t*3)
        p.polygon([(bx,350),(bx+direction*90,365+sway),(bx+direction*80,425+sway),(bx,411)],fill=(*color,185))
        p.line([(bx,350),(bx+direction*90,365+sway),(bx+direction*80,425+sway),(bx,411)],fill=(247,229,181,180),width=2)
    # Paper confetti follows a deterministic trajectory.
    for px,py,velocity,size,phase,color in particles:
        age=max(0,t-.55)
        yy=py+velocity*age+8*age**2
        xx=px+24*math.sin(age*1.8+phase)
        if t>.55 and -12<yy<H:
            angle=phase+age*2
            vx,vy=math.cos(angle)*size,math.sin(angle)*size
            p.polygon([(xx-vx,yy-vy),(xx+vy*.35,yy-vx*.35),(xx+vx,yy+vy),(xx-vy*.35,yy+vx*.35)],fill=(*color,185))
    canvas=Image.alpha_composite(canvas,layer)
    for i,(im,cx,phase) in enumerate(units):
        entrance=ease((t-.12-i*.045)/.7)
        jump_age=max(0,t-1.0-phase*.18)
        jump=max(0,math.sin(jump_age*math.pi*1.7))*18 if t>1+phase*.18 else 0
        settle=2*math.sin(t*3+phase)
        shadow=Image.new('RGBA',(W,H));sd=ImageDraw.Draw(shadow)
        spread=im.width*.34*(1-jump/150)
        sd.ellipse((cx-spread,625,cx+spread,639),fill=(101,91,65,37))
        canvas=Image.alpha_composite(canvas,shadow.filter(ImageFilter.GaussianBlur(3)))
        angle=2.5*math.sin(t*4+phase)*(entrance) if t>1 else (1-entrance)*(-7 if cx<W/2 else 7)
        sprite=im.rotate(angle,resample=Image.Resampling.BICUBIC,expand=True)
        sprite.putalpha(sprite.getchannel('A').point(lambda a:round(a*entrance)))
        xx=round(cx-sprite.width/2+(1-entrance)*(-90 if cx<W/2 else 90))
        yy=round(630-sprite.height-jump+settle)
        canvas.alpha_composite(sprite,(xx,yy))
    # The victory lockup arrives separately from the characters.
    title=Image.new('RGBA',(W,H));td=ImageDraw.Draw(title)
    a=round(255*ease((t-.2)/.6));dy=round(20*(1-ease((t-.2)/.7)))
    tracked(td,'P A P E R   K I N G D O M',W/2,61+dy,small,1,(99,115,91,a))
    title_text='VICTORY'
    td.text((W/2+1,103+dy+3),title_text,font=font,anchor='mt',fill=(128,94,35,round(a*.18)),stroke_width=1)
    td.text((W/2,103+dy),title_text,font=font,anchor='mt',fill=(158,114,42,a))
    tracked(td,'THE KINGDOM STANDS TOGETHER',W/2,218+dy,tiny,3,(104,111,91,a))
    for sign in [-1,1]:
        for k in range(7):
            angle=math.radians(130-k*11) if sign==-1 else math.radians(50+k*11)
            xx=W/2+sign*(300+k*5);yy=193-k*13+dy
            td.ellipse((xx-7,yy-3,xx+7,yy+3),fill=(184,148,71,round(a*.75)))
            if k:td.line((xx,yy,xx-sign*5,yy+13),fill=(184,148,71,a),width=1)
    # A few small gold glints at the raised weapons.
    for gx,gy,ph in [(408,309,0),(871,333,1),(284,405,2),(1089,433,3)]:
        brightness=max(0,math.sin(t*3.8+ph))**5
        size=4+brightness*7
        col=(255,244,192,round(brightness*200))
        td.polygon([(gx,gy-size),(gx+2,gy-2),(gx+size,gy),(gx+2,gy+2),(gx,gy+size),(gx-2,gy+2),(gx-size,gy),(gx-2,gy-2)],fill=col)
    tracked(td,'A LITTLE COURAGE. A GREAT VICTORY.',W/2,674,tiny,2,(120,114,90,a))
    canvas=Image.alpha_composite(canvas,title).convert('RGB')
    if t<.25:
        canvas=Image.blend(Image.new('RGB',(W,H),(247,242,228)),canvas,ease(t/.25))
    return canvas

# Silent browser-first formats, rendered directly from the current HD sprites.
common=['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an']
webm=subprocess.Popen(common+['-c:v','libvpx-vp9','-b:v','0','-crf','38','-row-mt','1','-threads','2','-pix_fmt','yuv420p',str(OUT/'victory-hd.webm')],stdin=subprocess.PIPE)
mp4=subprocess.Popen(common+['-c:v','libx264','-preset','slow','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',str(OUT/'victory-hd.mp4')],stdin=subprocess.PIPE)
for index in range(FPS*SECONDS):
    im=frame(index/FPS)
    if index==75: im.save(OUT/'victory-hd-poster.jpg',quality=92)
    data=im.tobytes()
    webm.stdin.write(data);mp4.stdin.write(data)
for process in (webm,mp4):
    process.stdin.close()
for process in (webm,mp4):
    if process.wait()!=0: raise RuntimeError('Encoding failed')
print('Rendered 5-second silent WebM, MP4 and poster in',OUT)
