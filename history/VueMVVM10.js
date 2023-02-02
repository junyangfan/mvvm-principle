// 发布-订阅   观察者    观察者模式中包含发布-订阅模式
// 发布-订阅   发布和订阅之间是没有必然联系的
// 观察者（观察者和被观察者） 被观察者中包含观察者

// 存储观察者的类Dep
class Dep{
    constructor(){
        this.subs = []; // subs中存放所有的watcher
    }
    //添加watcher 订阅
    addSub(watcher){
        this.subs.push(watcher) //把每一个观察者都添加到subs里
    }
    //通知 发布 通知subs容器中的所有观察者
    notify(){
        this.subs.forEach(watcher=>watcher.update())
    }
}

//观察者
class Watcher{
    constructor(vm,expr,cb){
        this.vm = vm
        this.expr = expr
        this.cb = cb    // cb表示当状态改变了，要干的事
        //刚开始需要保存一个老的状态
        this.oldValue = this.get()
    }
    //获取状态的方法
    get(){
        Dep.target = this;
        let value = CompilerUtil.getVal(this.vm,this.expr)
        //当通知后，把Dep.target置空
        Dep.target = null;
        return value
    }
    // 当状态发生改变后，会调用观察者的update方法来更新视图
    update(){
        let newVal = CompilerUtil.getVal(this.vm,this.expr)
        if(newVal !== this.oldValue){
            this.cb(newVal)
        }
    }
}

class Observer{
    constructor(data){
        this.observer(data)
    }
    observer(data){
        if(data && typeof data == 'object'){
            for(let key in data){
                this.defindReactive(data,key,data[key])
            }
        }
    }
    defindReactive(obj,key,value){
        this.observer(value)   
        //观察者
        let dep = new Dep()
        Object.defineProperty(obj,key,{
            get(){
                //使用
                Dep.target && dep.subs.push(Dep.target)
                return value
            },
            set:(newVal)=>{
                if(newVal != value){
                    this.observer(newVal)
                    value = newVal
                    //执行watcher中的update方法
                    dep.notify()
                }
            }
        })
    }
}

class Compiler{
    constructor(el,vm){
        this.el = this.isElementNode(el) ? el:document.querySelector(el)
        this.vm = vm
        let fragment = this.node2fragment(this.el)
        this.compile(fragment)
        this.el.appendChild(fragment)
    }
    isDirective(attrName){
        return attrName.startsWith('v-')    
    }
    compileElement(node){
        let attributes = node.attributes;  
        [...attributes].forEach(attr=>{
            let {name,value:expr} = attr;
            if(this.isDirective(name)){
                let [,directive] = name.split('-');
                CompilerUtil[directive](node,expr,this.vm);
            }
        })
    }
    compileText(node){
        let content = node.textContent;
        let reg = /\{\{(.+?)\}\}/;  
        reg.test(content)
        if(reg.test(content)){
            CompilerUtil['text'](node,content,this.vm)
        }
    }
    compile(node){
        let childNodes = node.childNodes;   
        [...childNodes].forEach(child=>{
            if(this.isElementNode(child)){
                this.compileElement(child);
                this.compile(child)
            }else{
                this.compileText(child)
            }
        })
    }
    node2fragment(node){
        let fragment = document.createDocumentFragment()
        let firstChild; 
        while(firstChild = node.firstChild){    
            fragment.appendChild(firstChild)
        }
        return fragment;
    }
    isElementNode(node){
        return node.nodeType === 1;
    }
}

CompilerUtil = {
    getVal(vm,expr){
        return expr.split(".").reduce((data,current)=>{
            return data[current]
        },vm.$data);
    },
    model(node,expr,vm){ 
        let fn = this.updater['modelUpdater']
        // 给输入框添加一个观察者，如果后面数据改变了，则视图更新
        new Watcher(vm,expr,(newVal)=>{
            fn(node,newVal)
        })
        let value = this.getVal(vm,expr)
        fn(node,value)
    },
    //得到新的内容
    getContentValue(vm,expr){
        return expr.replace(/\{\{(.+?)\}\}/g,(...args)=>{
            return this.getVal(vm,args[1])
        })
    },
    text(node,expr,vm){
        let fn = this.updater['textUpdater']
        let content = expr.replace(/\{\{(.+?)\}\}/g,(...args)=>{
            //添加观察者
            new Watcher(vm,args[1],()=>{
                fn(node,this.getContentValue(vm,expr));
            })
            return this.getVal(vm,args[1])
        })
        fn(node,content)
    },
    html(){
        console.log('处理v-html指令');
    },
    updater:{
        modelUpdater(node,value){
            node.value = value
        },
        textUpdater(node,value){
            node.textContent = value
        },
        htmlUpdater(){}
    },
}

class Vue{
    constructor(options){
        this.$el = options.el;
        this.$data = options.data;
        if(this.$el){
            new Observer(this.$data)
            new Compiler(this.$el,this)
        }
    }
}