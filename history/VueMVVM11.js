class Dep{
    constructor(){
        this.subs = []; 
    }
    addSub(watcher){
        this.subs.push(watcher) 
    }
    notify(){
        this.subs.forEach(watcher=>watcher.update())
    }
}

class Watcher{
    constructor(vm,expr,cb){
        this.vm = vm
        this.expr = expr
        this.cb = cb    
        this.oldValue = this.get()
    }
    get(){
        Dep.target = this;
        let value = CompilerUtil.getVal(this.vm,this.expr)
        Dep.target = null;
        return value
    }
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
        let dep = new Dep()
        Object.defineProperty(obj,key,{
            get(){
                Dep.target && dep.subs.push(Dep.target)
                return value
            },
            set:(newVal)=>{
                if(newVal != value){
                    this.observer(newVal)
                    value = newVal
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
    //设置数据
    setVal(vm,expr,value){
        expr.split('.').reduce((data,current,index,arr)=>{
            // 第1次：data是 school对象  current是"school"  index是0   arr是数组["school", "name"]
            // 第2次：data是undefined   cureent是"name"  index是1     arr是数组["school", "name"]
            // console.log(data,current,index,arr);
            if(index == arr.length-1){
                // console.log(current);   //name
                return data[current] = value
            }
            return data[current]
        },vm.$data)
    },
    model(node,expr,vm){ 
        let fn = this.updater['modelUpdater']
        new Watcher(vm,expr,(newVal)=>{
            fn(node,newVal)
        })
        //改变输入框数据本质是触发input方法
        node.addEventListener('input',(e)=>{
            let value = e.target.value  //e.target.value可以获得输入框中的内容
            //调用setVal方法，设置数据
            this.setVal(vm,expr,value)
        })
        let value = this.getVal(vm,expr)
        fn(node,value)
    },
    getContentValue(vm,expr){
        return expr.replace(/\{\{(.+?)\}\}/g,(...args)=>{
            return this.getVal(vm,args[1])
        })
    },
    text(node,expr,vm){
        let fn = this.updater['textUpdater']
        let content = expr.replace(/\{\{(.+?)\}\}/g,(...args)=>{
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