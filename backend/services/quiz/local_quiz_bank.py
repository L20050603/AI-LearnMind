QUESTION_BANK = {
    2: [
        {"type": "choice", "question": "操作系统最核心的职责是什么？", "options": ["管理硬件资源并提供抽象接口", "只负责运行浏览器", "替代编译器", "只管理网络"], "answer": "管理硬件资源并提供抽象接口", "explanation": "操作系统统一管理 CPU、内存、文件和设备，并向应用提供系统调用。"},
        {"type": "choice", "question": "系统调用的主要作用是？", "options": ["让用户程序请求内核服务", "直接修改硬件电路", "替代用户态程序", "关闭中断"], "answer": "让用户程序请求内核服务", "explanation": "系统调用是用户态进入内核态请求服务的受控入口。"},
    ],
    3: [
        {"type": "choice", "question": "进程与线程的主要区别是？", "options": ["进程拥有资源，线程是调度执行流", "线程拥有独立地址空间", "进程不能并发", "线程不能共享资源"], "answer": "进程拥有资源，线程是调度执行流", "explanation": "进程是资源分配单位，线程是 CPU 调度单位。"},
        {"type": "choice", "question": "临界区需要保护的原因是？", "options": ["避免共享数据竞争", "提升磁盘容量", "减少文件数量", "替代页表"], "answer": "避免共享数据竞争", "explanation": "多个执行流同时访问共享数据可能导致竞态。"},
    ],
    4: [
        {"type": "choice", "question": "RR 调度算法的关键参数是？", "options": ["时间片", "页面大小", "磁盘块号", "文件名"], "answer": "时间片", "explanation": "时间片大小直接影响响应时间和上下文切换次数。"},
        {"type": "choice", "question": "SJF 的优势通常是？", "options": ["降低平均等待时间", "一定公平", "无需估计运行时间", "只适合实时系统"], "answer": "降低平均等待时间", "explanation": "短作业优先通常能降低平均等待时间，但可能导致长作业饥饿。"},
    ],
    5: [
        {"type": "choice", "question": "分页地址转换需要哪两部分？", "options": ["页号和页内偏移", "文件名和目录名", "进程号和线程号", "磁道号和柱面号"], "answer": "页号和页内偏移", "explanation": "逻辑地址按页面大小拆分为页号和页内偏移。"},
        {"type": "choice", "question": "TLB 的作用是？", "options": ["缓存页表项加速地址转换", "保存文件目录", "替代 CPU 调度", "记录键盘输入"], "answer": "缓存页表项加速地址转换", "explanation": "TLB 是页表项快表，用于降低地址转换开销。"},
    ],
    6: [
        {"type": "choice", "question": "LRU 页面置换淘汰的是？", "options": ["最近最久未使用的页面", "最早进入内存的页面", "未来最长时间不用的页面", "编号最大的页面"], "answer": "最近最久未使用的页面", "explanation": "LRU 根据过去访问历史近似局部性。"},
        {"type": "choice", "question": "可能出现 Belady 异常的是？", "options": ["FIFO", "LRU", "OPT", "Clock 一定不会"], "answer": "FIFO", "explanation": "FIFO 是非栈类算法，可能因物理块增加反而缺页更多。"},
    ],
    7: [
        {"type": "choice", "question": "inode 主要保存什么？", "options": ["文件元数据和块索引信息", "CPU 时间片", "页表基址", "进程状态"], "answer": "文件元数据和块索引信息", "explanation": "inode 保存权限、大小、时间和数据块索引等。"},
        {"type": "choice", "question": "索引分配的优势是？", "options": ["支持随机访问和扩展", "完全没有额外开销", "只能顺序访问", "不能存大文件"], "answer": "支持随机访问和扩展", "explanation": "索引分配通过索引块定位数据块，兼顾随机访问与扩展。"},
    ],
    8: [
        {"type": "choice", "question": "期末综合复习最应该形成什么闭环？", "options": ["概念复述-例题-错因-再测", "只看目录", "只背答案", "只刷难题"], "answer": "概念复述-例题-错因-再测", "explanation": "综合复习需要把知识掌握和错题修复闭环起来。"},
        {"type": "choice", "question": "综合题拆解的合理方式是？", "options": ["先识别模块再套对应方法", "直接猜答案", "忽略题目条件", "只看最后一问"], "answer": "先识别模块再套对应方法", "explanation": "综合题通常跨调度、内存、文件系统等模块，先拆解更稳定。"},
    ],
}


def local_questions(knowledge_point_id: int, count=5):
    base = QUESTION_BANK.get(knowledge_point_id) or QUESTION_BANK[8]
    questions = []
    index = 0
    while len(questions) < count:
        item = base[index % len(base)]
        questions.append({**item, "id": len(questions) + 1, "difficulty": "normal"})
        index += 1
    return questions
