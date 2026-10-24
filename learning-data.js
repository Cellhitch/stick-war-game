/* Original practice questions. Each bank has 20 questions and one answer per item. */
const LEARNING_BANKS = {
  brother: [
    {id:'p01',topic:'平翘舌音',prompt:'“春天”的正确拼音是哪一个？',choices:['chūn tiān','cūn tiān','chún tiān','chūn tān'],answer:'chūn tiān',explanation:'“春”读 chūn，声母是翘舌音 ch，第一声；“天”读 tiān。连起来是 chūn tiān。'},
    {id:'p02',topic:'轻声',prompt:'“眼睛”的正确拼音是哪一个？',choices:['yǎn jing','yán jing','yǎn jīng','yǎng jing'],answer:'yǎn jing',explanation:'“眼”读 yǎn，是前鼻音 an；“眼睛”中的“睛”读轻声 jing，不标声调。'},
    {id:'p03',topic:'平翘舌音',prompt:'“森林”的正确拼音是哪一个？',choices:['sēn lín','shēn lín','sēng lín','sēn níng'],answer:'sēn lín',explanation:'“森”读 sēn，声母是平舌音 s，韵母是前鼻音 en；“林”读 lín。'},
    {id:'p04',topic:'前后鼻音',prompt:'“声音”的正确拼音是哪一个？',choices:['shēng yīn','shēn yīn','sēng yīn','shēng yīng'],answer:'shēng yīn',explanation:'“声”读 shēng，韵母是后鼻音 eng；“音”读 yīn，韵母是前鼻音 in。'},
    {id:'p05',topic:'轻声',prompt:'“朋友”的正确拼音是哪一个？',choices:['péng you','pén you','pèng you','péng yōu'],answer:'péng you',explanation:'“朋”读 péng，是第二声、后鼻音 eng；“朋友”中的“友”读轻声 you。'},
    {id:'p06',topic:'整体认读音节',prompt:'“花园”的“园”应该读什么？',choices:['yuán','yán','yuǎn','yún'],answer:'yuán',explanation:'“园”读 yuán，第二声。yuan 是整体认读音节，要整体认读。'},
    {id:'p07',topic:'平翘舌音',prompt:'“尺子”的“尺”应该读什么？',choices:['chǐ','cǐ','chí','chì'],answer:'chǐ',explanation:'“尺”读 chǐ，声母是翘舌音 ch，声调是第三声。'},
    {id:'p08',topic:'声母辨析',prompt:'“蓝天”的“蓝”应该读什么？',choices:['lán','nán','láng','lǎn'],answer:'lán',explanation:'“蓝”读 lán，声母是 l，不是 n；韵母是前鼻音 an，第二声。'},
    {id:'p09',topic:'声调辨析',prompt:'“河水”的“河”应该读什么？',choices:['hé','hē','hè','hě'],answer:'hé',explanation:'“河”读 hé，第二声，读的时候声音由低向高扬起。'},
    {id:'p10',topic:'韵母辨析',prompt:'“乌龟”的“龟”应该读什么？',choices:['guī','gū','kuī','guǐ'],answer:'guī',explanation:'“乌龟”的“龟”读 guī，第一声，不能漏掉韵母 ui 中的 i。'},
    {id:'p11',topic:'三拼音节',prompt:'“小鸟”的“鸟”应该读什么？',choices:['niǎo','liǎo','niáo','nǎo'],answer:'niǎo',explanation:'“鸟”读 niǎo，由声母 n、介母 i 和韵母 ao 组成，读第三声。'},
    {id:'p12',topic:'前后鼻音',prompt:'“已经”的“经”应该读什么？',choices:['jīng','jīn','jǐng','jìng'],answer:'jīng',explanation:'“经”读 jīng，韵母是后鼻音 ing，第一声。注意和前鼻音 in 区分。'},
    {id:'p13',topic:'多音字',prompt:'“快乐”的“乐”应该读什么？',choices:['lè','yuè','lē','yù'],answer:'lè',explanation:'“乐”是多音字。表示高兴、快乐时读 lè，所以“快乐”读 kuài lè。'},
    {id:'p14',topic:'多音字',prompt:'“音乐”的“乐”应该读什么？',choices:['yuè','lè','yù','yuē'],answer:'yuè',explanation:'“乐”表示音乐时读 yuè，所以“音乐”读 yīn yuè；表示快乐时才读 lè。'},
    {id:'p15',topic:'多音字',prompt:'“长大”的“长”应该读什么？',choices:['zhǎng','cháng','zhàng','chǎng'],answer:'zhǎng',explanation:'“长大”表示生长、成长，其中的“长”读 zhǎng，声调是第三声。'},
    {id:'p16',topic:'多音字',prompt:'“长江”的“长”应该读什么？',choices:['cháng','zhǎng','chǎng','zhàng'],answer:'cháng',explanation:'“长江”的“长”读 cháng，第二声；它和“长大”中的 zhǎng 读音不同。'},
    {id:'p17',topic:'多音字',prompt:'“种树”的“种”应该读什么？',choices:['zhòng','zhǒng','zòng','zhōng'],answer:'zhòng',explanation:'“种树”表示把树栽进土里，“种”在这里表示种植，读 zhòng。'},
    {id:'p18',topic:'多音字',prompt:'“种子”的“种”应该读什么？',choices:['zhǒng','zhòng','zǒng','zhōng'],answer:'zhǒng',explanation:'“种子”中的“种”读 zhǒng，第三声。表示种植动作时才读 zhòng。'},
    {id:'p19',topic:'多音字',prompt:'“背书”的“背”应该读什么？',choices:['bèi','bēi','běi','pèi'],answer:'bèi',explanation:'“背书”表示不看书而把内容念出来，“背”读 bèi，第四声。'},
    {id:'p20',topic:'多音字',prompt:'“背包”的“背”应该读什么？',choices:['bēi','bèi','běi','pēi'],answer:'bēi',explanation:'“背包”的“背”读 bēi，第一声，表示用背部背东西。和“背书”的 bèi 不同。'}
  ],
  sister: [
    {id:'m01',topic:'分数乘法',prompt:'计算：3/4 × 2/3 = ？',choices:['1/2','2/7','6/7','3/2'],answer:'1/2',explanation:'分子相乘、分母相乘：3/4 × 2/3 = 6/12。约分后得到 1/2。'},
    {id:'m02',topic:'分数除法',prompt:'计算：5/6 ÷ 5/12 = ？',choices:['2','1/2','25/72','5/2'],answer:'2',explanation:'除以一个非零分数，等于乘它的倒数：5/6 × 12/5 = 2。'},
    {id:'m03',topic:'混合运算',prompt:'计算：(3/4 + 1/8) × 8 = ？',choices:['7','4','6','8'],answer:'7',explanation:'先算括号：3/4 + 1/8 = 6/8 + 1/8 = 7/8，再算 7/8 × 8 = 7。'},
    {id:'m04',topic:'分数方程',prompt:'一个数的 3/5 是 18，这个数是多少？',choices:['30','10.8','27','25'],answer:'30',explanation:'设这个数为 x，则 3/5 × x = 18。x = 18 ÷ 3/5 = 18 × 5/3 = 30。'},
    {id:'m05',topic:'分数应用',prompt:'一本书有 150 页，弟弟读了全书的 2/5。他读了多少页？',choices:['60 页','30 页','75 页','90 页'],answer:'60 页',explanation:'求一个量的几分之几，用乘法：150 × 2/5 = 60（页）。'},
    {id:'m06',topic:'折扣',prompt:'一双运动鞋原价 200 元，打八折后售价是多少？',choices:['160 元','180 元','120 元','40 元'],answer:'160 元',explanation:'八折表示按原价的 80% 出售。售价 = 200 × 80% = 160（元）。'},
    {id:'m07',topic:'百分数',prompt:'一个班有 40 人，女生占 45%。女生有多少人？',choices:['18 人','22 人','16 人','20 人'],answer:'18 人',explanation:'女生人数 = 全班人数 × 女生所占百分比 = 40 × 45% = 18（人）。'},
    {id:'m08',topic:'百分数应用',prompt:'学校原有 80 本科普书，新增了原有数量的 25%。现在有多少本？',choices:['100 本','105 本','60 本','20 本'],answer:'100 本',explanation:'新增 80 × 25% = 20（本），现在共有 80 + 20 = 100（本）。'},
    {id:'m09',topic:'百分率',prompt:'计划收集 120 个塑料瓶，实际收集了 150 个。实际比计划多百分之几？',choices:['25%','20%','30%','125%'],answer:'25%',explanation:'多收集 150 − 120 = 30（个）。与计划比较，要以 120 为单位“1”：30 ÷ 120 = 25%。'},
    {id:'m10',topic:'按比分配',prompt:'合唱队有 40 人，男生与女生人数比是 3∶2。男生有多少人？',choices:['24 人','16 人','20 人','30 人'],answer:'24 人',explanation:'总份数是 3 + 2 = 5，男生占 3/5。40 × 3/5 = 24（人）。'},
    {id:'m11',topic:'化简比',prompt:'把 12∶18 化成最简单的整数比，结果是哪一个？',choices:['2∶3','3∶2','6∶9','1∶6'],answer:'2∶3',explanation:'12 和 18 的最大公因数是 6。比的前项、后项同时除以 6，得到 2∶3。'},
    {id:'m12',topic:'比例尺',prompt:'一张公园地图的比例尺为 1∶1000，图上两点相距 5 厘米。实际相距多少米？',choices:['50 米','5 米','500 米','5000 米'],answer:'50 米',explanation:'实际距离 = 5 × 1000 = 5000（厘米）。100 厘米 = 1 米，所以是 50 米。'},
    {id:'m13',topic:'圆的周长',prompt:'一个圆的半径是 3 厘米，周长是多少？（π 取 3.14）',choices:['18.84 厘米','9.42 厘米','28.26 厘米','6 厘米'],answer:'18.84 厘米',explanation:'圆的周长 C = 2πr。代入 r = 3：2 × 3.14 × 3 = 18.84（厘米）。'},
    {id:'m14',topic:'圆的面积',prompt:'一个圆的直径是 10 厘米，面积是多少？（π 取 3.14）',choices:['78.5 平方厘米','31.4 平方厘米','314 平方厘米','15.7 平方厘米'],answer:'78.5 平方厘米',explanation:'先求半径：10 ÷ 2 = 5（厘米）。面积 S = πr² = 3.14 × 5² = 78.5（平方厘米）。'},
    {id:'m15',topic:'图形变化',prompt:'一个圆的半径扩大到原来的 2 倍，面积变为原来的几倍？',choices:['4 倍','2 倍','6 倍','8 倍'],answer:'4 倍',explanation:'圆的面积 S = πr²。半径扩大到 2 倍，面积就扩大到 2² = 4 倍。'},
    {id:'m16',topic:'圆柱体积',prompt:'一个圆柱的底面积是 12 平方厘米，高是 5 厘米。体积是多少？',choices:['60 立方厘米','20 立方厘米','17 立方厘米','120 立方厘米'],answer:'60 立方厘米',explanation:'圆柱体积 V = 底面积 × 高 = 12 × 5 = 60（立方厘米）。'},
    {id:'m17',topic:'圆锥体积',prompt:'一个圆锥与一个圆柱等底等高。圆柱体积是 90 立方厘米，圆锥体积是多少？',choices:['30 立方厘米','45 立方厘米','90 立方厘米','270 立方厘米'],answer:'30 立方厘米',explanation:'等底等高的圆锥体积是圆柱体积的 1/3，所以 90 ÷ 3 = 30（立方厘米）。'},
    {id:'m18',topic:'立体图形',prompt:'一个正方体的棱长是 3 厘米，体积是多少？',choices:['27 立方厘米','9 立方厘米','18 立方厘米','54 立方厘米'],answer:'27 立方厘米',explanation:'正方体体积 V = 棱长 × 棱长 × 棱长 = 3 × 3 × 3 = 27（立方厘米）。'},
    {id:'m19',topic:'反比例',prompt:'路程一定时，行驶速度与所用时间成什么比例关系？',choices:['反比例','正比例','不成比例','相等关系'],answer:'反比例',explanation:'速度 × 时间 = 路程。路程一定，两个量的乘积一定，因此速度与时间成反比例。'},
    {id:'m20',topic:'分数应用',prompt:'游览深圳湾公园，甲走了全程的 3/8，乙走了全程的 1/4。甲比乙多走了全程的几分之几？',choices:['1/8','1/4','5/8','1/2'],answer:'1/8',explanation:'先通分：1/4 = 2/8。甲比乙多走 3/8 − 2/8 = 1/8，是全程的 1/8。'}
  ]
};
if (typeof module !== 'undefined' && module.exports) module.exports = LEARNING_BANKS;
