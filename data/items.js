/**
 * 站点唯一数据源。
 * 新增内容 = 在数组里加一条对象，列表页和标签页会自动出现。
 * 规则：
 *  - 只有 status: 'published' 的条目会对外显示（draft / internal 自动隐藏）
 *  - type: 'work' 进作品页，type: 'article' 进文章页
 *  - 标签无需注册，写在 tags 里即可，标签页自动去重聚合
 */
window.ITEMS = [
  {
    id: 'travel-planner',
    type: 'work',
    title: '旅游规划器',
    summary: '输入目的地和天数，自动生成每日行程草案的小工具。',
    date: '2026-09-12',
    tags: ['旅游规划', 'AI工具'],
    cover: 'assets/covers/travel.svg',
    body: '',
    externalUrl: 'projects/travel-planner/index.html',
    embed: true,
    status: 'published',
    featured: true,
    relatedIds: ['article-ai-travel']
  },
  {
    id: 'article-ai-travel',
    type: 'article',
    title: '我是怎么用 AI 做出旅游规划器的',
    summary: '一次从想法到成品的完整复盘：需求拆解、提示词迭代、以及哪些地方必须自己动手。',
    date: '2026-09-12',
    tags: ['旅游规划', 'AI工具'],
    cover: '',
    body: `
      <p>这个小工具的起点很简单：每次出门旅行，我都要在地图、备忘录和表格之间来回切换，信息散落一地。我想要一个页面，输入目的地和天数，直接给我一份可以动手改的行程草案。</p>
      <h2>需求拆解</h2>
      <p>我先写下三句话：它只做行程草案，不做预订；它必须离线可用，双击就能打开；它的输出必须是可以继续编辑的，而不是一张死图。这三句话后来挡住了所有"要不再加个功能"的冲动。</p>
      <h2>和 AI 的分工</h2>
      <p>界面结构和初版代码由 AI 生成，我负责提需求和挑毛病。真正花时间的部分反而是目的地数据——哪些景点值得排进去、每天排几个不至于赶路，这些判断 AI 给不了，得自己来。</p>
      <h2>留下的问题</h2>
      <p>目前目的地数据是写死的，只覆盖几个城市。如果以后做得多了，可能会把它升级成一个独立的"旅游规划"展厅，把工具、复盘和目的地的具体方案聚合在一起。</p>
    `,
    externalUrl: '',
    embed: false,
    status: 'published',
    featured: true,
    relatedIds: ['travel-planner']
  },
  {
    id: 'article-about-site',
    type: 'article',
    title: '关于本站：一个小展厅的开门说明',
    summary: '这个站是什么，为什么只展示成品，以及内容将如何生长。',
    date: '2026-09-12',
    tags: ['建站说明'],
    cover: '',
    body: `
      <p>这是我的个人数字展览馆，也是公开写作库。这里只放两类东西：已经做完的作品，和已经写完的文章。</p>
      <h2>为什么只放成品</h2>
      <p>草稿、半成品和私人想法有它们自己的去处，不在这里。这个站对外，所以它只回答一个问题：我做出过什么、想清楚过什么。这个边界让我发布时更慎重，也让来访者不用在噪音里翻找。</p>
      <h2>内容如何生长</h2>
      <p>现在内容很少，所以这里没有复杂的分类，只有标签。每篇内容发布时手动打上标签，标签页自动聚合。等某个标签下的内容多起来——比如"旅游规划"或"数据工具"——它自然会升级成一个专题展厅。标签页就是展厅的前身。</p>
    `,
    externalUrl: '',
    embed: false,
    status: 'published',
    featured: false,
    relatedIds: []
  }
];
