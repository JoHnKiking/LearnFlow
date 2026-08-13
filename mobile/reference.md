	<!DOCTYPE html>
	<html lang="zh-CN">
	<head>
	    <meta charset="UTF-8">
	    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
	    <title>LearnFlow - 星球像素风</title>
	    <!-- 引入 React 和 Babel -->
	    <script src="https://cdn.jsdelivr.net/npm/react@18.0.0/umd/react.development.js"></script>
	    <script src="https://cdn.jsdelivr.net/npm/react-dom@18.0.0/umd/react-dom.development.js"></script>
	    <script src="https://cdn.jsdelivr.net/npm/@babel/standalone/babel.js"></script>
	    <!-- 引入 Tailwind CSS -->
	    <script src="https://cdn.tailwindcss.com"></script>
	    <!-- 引入 Font Awesome -->
	    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
	    <!-- 自定义配置与样式 -->
	    <style>
	        :root {
	            --space-bg: #020205;
	            --card-bg: rgba(26, 32, 53, 0.85);
	            --accent-purple: #6d5dfc;
	            --accent-cyan: #00f2fe;
	            --text-main: #ffffff;
	            --text-sub: #94a3b8;
	            --planet-purple: #4b3f96;
	            --planet-blue: #1e40af;
	        }
	        body {
	            background-color: var(--space-bg);
	            color: white;
	            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
	            overflow-x: hidden;
	            margin: 0;
	            padding: 0;
	        }
	        /* 像素风滚动条 */
	        ::-webkit-scrollbar {
	            width: 6px;
	        }
	        ::-webkit-scrollbar-track {
	            background: transparent; 
	        }
	        ::-webkit-scrollbar-thumb {
	            background: #334155; 
	            border-radius: 3px;
	        }
	        /* 星星动画 */
	        @keyframes twinkle {
	            0% { opacity: 0.3; transform: scale(0.8); }
	            100% { opacity: 1; transform: scale(1.2); }
	        }
	        .star {
	            position: absolute;
	            background-color: white;
	            border-radius: 50%;
	            animation: twinkle infinite ease-in-out;
	        }
	        /* 像素星球样式 */
	        .pixel-planet {
	            position: absolute;
	            border-radius: 50%;
	            filter: blur(0px); /* 保持清晰边缘 */
	            z-index: 0;
	        }
	        .pixel-art-border {
	            box-shadow: 0 0 0 2px rgba(255,255,255,0.1);
	        }
	        /* 输入框聚焦效果 */
	        .cyber-input:focus {
	            outline: none;
	            box-shadow: 0 0 0 2px var(--accent-cyan);
	        }
	        /* 开关样式 */
	        .toggle-checkbox:checked {
	            right: 0;
	            border-color: #68D391;
	        }
	        .toggle-checkbox:checked + .toggle-label {
	            background-color: #68D391;
	        }
	        /* 底部导航安全区域 */
	        .safe-bottom {
	            padding-bottom: env(safe-area-inset-bottom, 20px);
	        }
	    </style>
	</head>
	<body>
	    <div id="root"></div>
	    <script type="text/babel">
	        const { useState, useEffect, useRef } = React;
	        // ==========================================
	        // 组件 1: 背景宇宙 (图4 元素)
	        // ==========================================
	        const SpaceBackground = () => {
	            return (
	                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
	                    {/* 星星生成 */}
	                    {[...Array(40)].map((_, i) => (
	                        <div
	                            key={i}
	                            className="star"
	                            style={{
	                                width: Math.random() * 3 + 1 + 'px',
	                                height: Math.random() * 3 + 1 + 'px',
	                                top: Math.random() * 100 + '%',
	                                left: Math.random() * 100 + '%',
	                                animationDuration: Math.random() * 3 + 2 + 's',
	                                animationDelay: Math.random() * 5 + 's'
	                            }}
	                        />
	                    ))}
	                    {/* 图4: 蓝色星球 (左上) */}
	                    <div className="pixel-planet w-64 h-64 bg-gradient-to-br from-blue-400 to-blue-900 opacity-80 -top-20 -left-20 blur-sm" 
	                         style={{ clipPath: 'circle(50% at 50% 50%)' }}>
	                         <div className="w-full h-full opacity-50 mix-blend-overlay"
	                              style={{backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent)'}}></div>
	                    </div>
	                    {/* 图4: 紫色大星球 (右下) */}
	                    <div className="pixel-planet w-96 h-96 bg-gradient-to-tr from-indigo-900 via-purple-800 to-pink-600 opacity-90 -bottom-32 -right-32 blur-md">
	                        {/* 表面纹理模拟 */}
	                        <div className="absolute inset-0 rounded-full" 
	                             style={{boxShadow: 'inset -20px -20px 50px rgba(0,0,0,0.5), inset 10px 10px 30px rgba(255,255,255,0.1)'}}></div>
	                        {/* 小陨石坑 */}
	                        <div className="absolute top-1/3 left-1/4 w-16 h-16 rounded-full bg-black opacity-20 blur-sm"></div>
	                        <div className="absolute bottom-1/3 right-1/3 w-24 h-24 rounded-full bg-black opacity-20 blur-sm"></div>
	                    </div>
	                    {/* 图4: 小行星 (中左) */}
	                    <div className="pixel-planet w-32 h-32 bg-gray-700 top-1/2 left-[-50px] opacity-60 rotate-12"></div>
	                    {/* 图4: 远处的环状星体 */}
	                    <div className="absolute top-1/4 right-10 w-48 h-24 border-4 border-blue-400/30 rounded-full opacity-50 rotate-12"></div>
	                </div>
	            );
	        };
	        // ==========================================
	        // 组件 2: 状态栏 (Mock)
	        // ==========================================
	        const StatusBar = () => (
	            <div className="flex justify-between items-center px-4 py-2 text-xs font-medium text-white z-50 relative select-none">
	                <div className="flex items-center gap-1">
	                    <span>18:47</span>
	                    <i className="fas fa-video text-red-500 ml-1"></i> {/* Mock icon */}
	                </div>
	                <div className="flex items-center gap-2">
	                    <i className="fas fa-signal"></i>
	                    <span>5G</span>
	                    <div className="w-6 h-3 bg-green-500 rounded-sm relative flex items-center p-0.5">
	                        <div className="h-full w-4/5 bg-white rounded-sm"></div>
	                    </div>
	                    <span>89</span>
	                    <i className="fas fa-bolt text-yellow-400"></i>
	                </div>
	            </div>
	        );
	        // ==========================================
	        // 组件 3: 登录页 (图2)
	        // ==========================================
	        const LoginPage = ({ onLogin }) => {
	            const [isLogin, setIsLogin] = useState(true);
	            const [showPwd, setShowPwd] = useState(false);
	            return (
	                <div className="relative z-10 flex flex-col items-center justify-start h-screen pt-10 px-6 animate-fade-in">
	                    {/* Logo & Title */}
	                    <div className="mb-8 flex flex-col items-center mt-10">
	                        <div className="text-6xl mb-4 text-white drop-shadow-lg">
	                            <i className="fas fa-bolt"></i>
	                        </div>
	                        <h1 className="text-4xl font-bold tracking-wider mb-2">LearnFlow</h1>
	                        <p className="text-cyan-300 text-lg">开启你的技能冒险之旅</p>
	                    </div>
	                    {/* Toggle Buttons */}
	                    <div className="w-full max-w-sm bg-slate-900/80 p-1 rounded-xl flex mb-8 backdrop-blur-sm border border-slate-700">
	                        <button 
	                            onClick={() => setIsLogin(true)}
	                            className={`flex-1 py-3 rounded-lg text-center font-bold transition-all ${isLogin ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
	                        >
	                            登录
	                        </button>
	                        <button 
	                            onClick={() => setIsLogin(false)}
	                            className={`flex-1 py-3 rounded-lg text-center font-bold transition-all ${!isLogin ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
	                        >
	                            注册
	                        </button>
	                    </div>
	                    {/* Form */}
	                    <div className="w-full max-w-sm space-y-5">
	                        <div className="relative group">
	                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
	                                <i className="fas fa-envelope text-cyan-400 group-focus-within:text-white transition-colors"></i>
	                            </div>
	                            <input type="email" placeholder="邮箱" 
	                                className="cyber-input w-full bg-slate-900/80 text-white pl-12 pr-4 py-4 rounded-xl border border-slate-700 placeholder-slate-500 focus:border-cyan-400 transition-all" 
	                            />
	                        </div>
	                        <div className="relative group">
	                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
	                                <i className="fas fa-lock text-cyan-400 group-focus-within:text-white transition-colors"></i>
	                            </div>
	                            <input type={showPwd ? "text" : "password"} placeholder="密码" 
	                                className="cyber-input w-full bg-slate-900/80 text-white pl-12 pr-12 py-4 rounded-xl border border-slate-700 placeholder-slate-500 focus:border-cyan-400 transition-all" 
	                            />
	                            <button onClick={() => setShowPwd(!showPwd)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-cyan-400 hover:text-white">
	                                <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`}></i>
	                            </button>
	                        </div>
	                        {!isLogin && (
	                             <div className="animate-pulse text-xs text-red-400 text-right">演示模式：无需真实验证</div>
	                        )}
	                        <div className="text-right">
	                            <a href="#" className="text-sm text-cyan-400 hover:underline">忘记密码?</a>
	                        </div>
	                        <button 
	                            onClick={onLogin}
	                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform hover:brightness-110"
	                        >
	                            {isLogin ? '登录' : '创建账号'}
	                        </button>
	                    </div>
	                    {/* Divider */}
	                    <div className="flex items-center w-full max-w-sm my-8">
	                        <div className="flex-grow border-t border-slate-700"></div>
	                        <span className="mx-4 text-slate-500 text-sm">或者</span>
	                        <div className="flex-grow border-t border-slate-700"></div>
	                    </div>
	                    {/* Social Login */}
	                    <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
	                        <button className="flex items-center justify-center gap-2 bg-slate-900/80 border border-slate-700 py-3 rounded-xl hover:bg-slate-800 transition-colors">
	                            <i className="fab fa-google text-red-500 text-xl"></i>
	                            <span className="font-medium">Google</span>
	                        </button>
	                        <button className="flex items-center justify-center gap-2 bg-slate-900/80 border border-slate-700 py-3 rounded-xl hover:bg-slate-800 transition-colors">
	                            <i className="fab fa-apple text-white text-xl"></i>
	                            <span className="font-medium">Apple</span>
	                        </button>
	                        <button className="flex items-center justify-center gap-2 bg-slate-900/80 border border-slate-700 py-3 rounded-xl hover:bg-slate-800 transition-colors">
	                            <i className="fab fa-weixin text-green-500 text-xl"></i>
	                            <span className="font-medium">微信</span>
	                        </button>
	                    </div>
	                    <div className="mt-auto mb-4 text-slate-600 text-xs">豆包AI生成</div>
	                </div>
	            );
	        };
	        // ==========================================
	        // 组件 4: 主页 - 我的怪兽 (图1)
	        // ==========================================
	        const HomePage = ({ onNavigate }) => {
	            const [activeTab, setActiveTab] = useState('task');
	            const [tasks, setTasks] = useState([
	                { id: 1, text: '哈哈哈哈', done: false },
	                { id: 2, text: '复习 React Hooks', done: true },
	                { id: 3, text: '完成像素风设计稿', done: false },
	            ]);
	            const [newTask, setNewTask] = useState('');
	            const [timerChoice, setTimerChoice] = useState(25);
	            const addTask = () => {
	                if(newTask.trim()) {
	                    setTasks([...tasks, {id: Date.now(), text: newTask, done: false}]);
	                    setNewTask('');
	                }
	            };
	            const toggleTask = (id) => {
	                setTasks(tasks.map(t => t.id === id ? {...t, done: !t.done} : t));
	            };
	            const deleteTask = (id) => {
	                setTasks(tasks.filter(t => t.id !== id));
	            };
	            return (
	                <div className="relative z-10 pb-24 min-h-screen pt-2 px-4">
	                    {/* Header */}
	                    <div className="flex justify-between items-center mb-4">
	                        <h1 className="text-2xl font-bold text-white">我的怪兽</h1>
	                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
	                    </div>
	                    {/* Monster Card (图1 Top) */}
	                    <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl p-4 mb-6 relative overflow-hidden">
	                        <div className="flex items-start gap-4 relative z-10">
	                            {/* Avatar */}
	                            <div className="w-20 h-20 bg-teal-900/50 border-2 border-teal-500/50 rounded-lg flex items-center justify-center text-4xl">
	                                🦁
	                            </div>
	                            {/* Info */}
	                            <div className="flex-1">
	                                <div className="flex justify-between items-start">
	                                    <div>
	                                        <h2 className="text-xl font-bold text-white">哈哈哈哈...</h2>
	                                        <div className="flex items-center gap-2 text-orange-400 text-sm font-bold mt-1">
	                                            <span>Lv 50</span>
	                                            <span className="text-xs bg-yellow-500/20 px-1 rounded text-yellow-200">活力型怪兽</span>
	                                            <i className="fas fa-info-circle text-slate-500 text-xs"></i>
	                                        </div>
	                                    </div>
	                                    <button className="bg-teal-900/50 border border-teal-500/50 text-teal-300 px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-teal-800/50">
	                                        <i className="fas fa-gamepad"></i> 游戏
	                                    </button>
	                                </div>
	                                {/* Energy Bar */}
	                                <div className="mt-4">
	                                    <div className="flex items-center gap-2 text-xs text-blue-300 mb-1">
	                                        <i className="fas fa-bolt text-orange-400"></i>
	                                        <span>体力</span>
	                                    </div>
	                                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
	                                        <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 w-full rounded-full"></div>
	                                    </div>
	                                    <div className="text-xs text-slate-400 mt-1">100/100</div>
	                                </div>
	                            </div>
	                        </div>
	                    </div>
	                    {/* Tabs */}
	                    <div className="flex gap-4 mb-4">
	                        {['任务', '对话', '笔记'].map(tab => (
	                            <button key={tab}
	                                onClick={() => setActiveTab(tab === '任务' ? 'task' : tab.toLowerCase())}
	                                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
	                                    (tab === '任务' && activeTab === 'task') || activeTab === tab.toLowerCase()
	                                    ? 'bg-teal-900/60 text-teal-300 border border-teal-700' 
	                                    : 'text-slate-400 hover:text-white'
	                                }`}
	                            >
	                                <i className={`fas ${tab === '任务' ? 'fa-layer-group' : tab === '对话' ? 'fa-comment-dots' : 'fa-file-alt'}`}></i>
	                                {tab}
	                            </button>
	                        ))}
	                    </div>
	                    {/* Content Area based on Tab */}
	                    {activeTab === 'task' && (
	                        <div className="space-y-6 animate-fade-in">
	                            {/* Task List Card */}
	                            <div className="bg-slate-900/80 border border-teal-900/50 rounded-lg p-4">
	                                <div className="flex items-center gap-2 mb-4 text-slate-300">
	                                    <i className="fas fa-check-circle"></i>
	                                    <span className="font-medium">Keys to Success</span>
	                                </div>
	                                {/* Add Task Input */}
	                                <div className="flex gap-2 mb-4">
	                                    <input 
	                                        value={newTask}
	                                        onChange={(e) => setNewTask(e.target.value)}
	                                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
	                                        placeholder="添加新任务..." 
	                                        className="flex-1 bg-transparent border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
	                                    />
	                                    <button onClick={addTask} className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700">
	                                        <i className="fas fa-plus"></i>
	                                    </button>
	                                </div>
	                                {/* Task Items */}
	                                <div className="space-y-3">
	                                    {tasks.map(task => (
	                                        <div key={task.id} className="flex items-center gap-3 group">
	                                            <input 
	                                                type="checkbox" 
	                                                checked={task.done}
	                                                onChange={() => toggleTask(task.id)}
	                                                className="w-5 h-5 rounded border-slate-600 bg-slate-800 checked:bg-white checked:border-white appearance-none cursor-pointer relative
	                                                after:content-[''] after:absolute after:left-1.5 after:top-1 after:w-1.5 after:h-2.5 after:border-white after:border-r-2 after:border-b-2 after:rotate-45 after:hidden checked:after:block"
	                                                style={{color: task.done ? 'white' : 'transparent'}}
	                                            />
	                                            <span className={`flex-1 text-sm ${task.done ? 'line-through text-slate-600' : 'text-slate-200'}`}>
	                                                {task.text}
	                                            </span>
	                                            <button onClick={() => deleteTask(task.id)} className="text-red-500/70 opacity-0 group-hover:opacity-100 transition-opacity">
	                                                <i className="fas fa-trash-alt"></i>
	                                            </button>
	                                        </div>
	                                    ))}
	                                </div>
	                            </div>
	                            {/* Pomodoro Card */}
	                            <div className="bg-slate-900/80 border border-teal-900/50 rounded-lg p-4">
	                                <div className="flex items-center gap-2 mb-4 text-red-400">
	                                    <i className="far fa-clock"></i>
	                                    <span className="font-bold">番茄钟</span>
	                                </div>
	                                <div className="grid grid-cols-3 gap-3">
	                                    {[25, 45, 60].map(min => (
	                                        <button 
	                                            key={min}
	                                            onClick={() => setTimerChoice(min)}
	                                            className={`py-2 rounded text-sm font-medium transition-all ${
	                                                timerChoice === min 
	                                                ? 'bg-teal-900/60 text-cyan-300 border border-teal-600' 
	                                                : 'bg-slate-800/50 text-slate-400 border border-transparent hover:bg-slate-700'
	                                            }`}
	                                        >
	                                            {min}分钟
	                                        </button>
	                                    ))}
	                                </div>
	                                <div className="mt-4 text-center">
	                                    <div className="inline-block bg-slate-800 px-6 py-3 rounded-full border border-slate-700">
	                                        <span className="text-2xl font-mono text-white">{timerChoice}:00</span>
	                                    </div>
	                                </div>
	                            </div>
	                        </div>
	                    )}
	                     {activeTab !== 'task' && (
	                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
	                            <i className="fas fa-hammer text-3xl mb-2"></i>
	                            <p>该模块正在开发中...</p>
	                        </div>
	                     )}
	                </div>
	            );
	        };
	        // ==========================================
	        // 组件 5: 个人中心 (图0)
	        // ==========================================
	        const SettingsPage = ({ onLogout }) => {
	            const [settings, setSettings] = useState({
	                reminder: true,
	                darkMode: true,
	            });
	            const toggleSetting = (key) => {
	                setSettings(prev => ({...prev, [key]: !prev[key]}));
	            };
	            const SettingItem = ({ icon, label, hasToggle, toggleKey, hasArrow, colorClass = "text-blue-400", onClick }) => (
	                <div className="flex items-center justify-between p-4 bg-slate-900/80 border-b border-slate-800 last:border-0 first:rounded-t-lg last:rounded-b-lg group cursor-pointer hover:bg-slate-800/80 transition-colors" onClick={onClick}>
	                    <div className="flex items-center gap-4">
	                        <div className={`w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center ${colorClass}`}>
	                            <i className={`${icon} text-lg`}></i>
	                        </div>
	                        <span className="text-white font-medium">{label}</span>
	                    </div>
	                    {hasToggle && (
	                        <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
	                            <input type="checkbox" name="toggle" id={toggleKey} 
	                                checked={settings[toggleKey]}
	                                onChange={() => toggleSetting(toggleKey)}
	                                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out translate-x-0"
	                                style={{top: 0, left: 0}}
	                            />
	                            <label htmlFor={toggleKey} className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-700 cursor-pointer transition-colors duration-200 ease-in-out"></label>
	                        </div>
	                    )}
	                    {hasArrow && !hasToggle && (
	                        <i className="fas fa-chevron-right text-slate-600 group-hover:text-slate-400"></i>
	                    )}
	                </div>
	            );
	            return (
	                <div className="relative z-10 pb-24 min-h-screen pt-2 px-4">
	                    <h1 className="text-2xl font-bold text-white mb-6">个人中心</h1>
	                    {/* User Profile Card */}
	                    <div className="bg-slate-900/90 border border-slate-700 rounded-lg p-6 mb-6 flex items-center gap-4 relative overflow-hidden">
	                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl"></div>
	                        <div className="relative">
	                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-16 h-16 rounded-lg border-2 border-teal-500/50 bg-slate-800" />
	                            <div className="absolute bottom-0 right-0 bg-slate-800 rounded-full p-1 border border-slate-600">
	                                <i className="fas fa-pencil-alt text-xs text-white"></i>
	                            </div>
	                        </div>
	                        <div className="z-10">
	                            <h2 className="text-xl font-bold text-white">斤斤计较</h2>
	                            <div className="flex gap-4 text-xs text-cyan-300 mt-2">
	                                <span><i className="far fa-calendar-alt mr-1"></i>加入1天</span>
	                                <span><i className="fas fa-th-large mr-1"></i>1个领域</span>
	                            </div>
	                        </div>
	                    </div>
	                    {/* Big Settings Button */}
	                    <button className="w-full bg-slate-800/80 border border-slate-700 text-slate-300 py-3 rounded-lg mb-6 flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors">
	                        <i className="fas fa-cog"></i> 设置
	                    </button>
	                    {/* Settings List Group 1 */}
	                    <div className="rounded-lg overflow-hidden border border-slate-800 mb-4">
	                        <SettingItem icon="fas fa-bell" label="学习提醒" hasToggle={true} toggleKey="reminder" />
	                        <SettingItem icon="fas fa-moon" label="深色模式" hasToggle={true} toggleKey="darkMode" />
	                        <SettingItem icon="fas fa-shield-alt" label="隐私设置" hasArrow={true} />
	                    </div>
	                    {/* Settings List Group 2 */}
	                    <div className="rounded-lg overflow-hidden border border-slate-800 mb-4">
	                        <SettingItem icon="fas fa-book-open" label="LearnFlow指南" hasArrow={true} />
	                        <SettingItem icon="fas fa-comment-dots" label="使用反馈" hasArrow={true} />
	                    </div>
	                    {/* Logout Button */}
	                    <button 
	                        onClick={onLogout}
	                        className="w-full bg-red-900/20 border border-red-900/50 text-red-400 py-3 rounded-lg font-bold hover:bg-red-900/40 transition-colors mt-8"
	                    >
	                        退出登录
	                    </button>
	                </div>
	            );
	        };
	        // ==========================================
	        // 组件 6: 底部导航
	        // ==========================================
	        const BottomNav = ({ current, onChange }) => {
	            const navItems = [
	                { id: 'map', label: '地图', icon: 'fas fa-map' }, // Placeholder for Map tab
	                { id: 'monster', label: '怪兽', icon: 'fas fa-star' }, // Home/Monster
	                { id: 'settings', label: '我的', icon: 'fas fa-user' } // Settings
	            ];
	            return (
	                <div className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-slate-800 safe-bottom z-50">
	                    <div className="flex justify-around items-center h-16 max-w-md mx-auto">
	                        {navItems.map(item => {
	                            const isActive = (item.id === 'monster' && current === 'home') || (item.id === 'settings' && current === 'settings');
	                            return (
	                                <button 
	                                    key={item.id}
	                                    onClick={() => onChange(item.id === 'monster' ? 'home' : item.id === 'settings' ? 'settings' : 'map')}
	                                    className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
	                                        isActive ? 'text-white' : 'text-slate-500'
	                                    }`}
	                                >
	                                    <i className={`${item.icon} text-xl mb-1 ${isActive ? 'drop-shadow-glow' : ''}`}></i>
	                                    <span className="text-xs">{item.label}</span>
	                                    {isActive && <div className="absolute top-0 w-8 h-1 bg-slate-600 rounded-b-full"></div>}
	                                </button>
	                            );
	                        })}
	                    </div>
	                </div>
	            );
	        };
	        // ==========================================
	        // 主应用容器
	        // ==========================================
	        const App = () => {
	            const [currentView, setCurrentView] = useState('login'); // login, home, settings
	            // 模拟登录流程
	            const handleLogin = () => {
	                setCurrentView('home');
	            };
	            const handleLogout = () => {
	                setCurrentView('login');
	            };
	            const renderContent = () => {
	                switch(currentView) {
	                    case 'login':
	                        return <LoginPage onLogin={handleLogin} />;
	                    case 'home':
	                        return <HomePage onNavigate={setCurrentView} />;
	                    case 'settings':
	                        return <SettingsPage onLogout={handleLogout} />;
	                    default:
	                        return <HomePage onNavigate={setCurrentView} />;
	                }
	            };
	            return (
	                <div className="max-w-md mx-auto min-h-screen relative bg-black shadow-2xl overflow-hidden sm:rounded-xl sm:min-h-[100vh] sm:my-0 sm:border-x sm:border-slate-800">
	                    <SpaceBackground />
	                    {/* 仅在非登录页显示状态栏和底部导航 */}
	                    {currentView !== 'login' && <StatusBar />}
	                    <main className="relative z-10 min-h-screen flex flex-col">
	                        {renderContent()}
	                    </main>
	                    {currentView !== 'login' && (
	                        <BottomNav current={currentView} onChange={setCurrentView} />
	                    )}
	                </div>
	            );
	        };
	        const root = ReactDOM.createRoot(document.getElementById('root'));
	        root.render(<App />);
	    </script>
	</body>
	</html>