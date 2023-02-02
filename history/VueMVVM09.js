// 实现数据的响应式  new
class Observer{
    constructor(data){
        // 此时，数据还不是响应式的
        // console.log(data)  // school: {name: "HuangHuai", age: 100}
        this.observer(data)
    }
    // 把上面的数据变成响应式数据 把一个对象数据做成响应式
    observer(data){
        //如果data存在且类型是object类型
        if(data && typeof data == 'object'){
            // console.log(data);  //school: {name: "HuangHuai", age: 10}
            //for in 循环一个js对象
            for(let key in data){
                // console.log(key);   //school
                // console.log(data[key])  //{name: "HuangHuai", age: 10}
                //调用defindReactive方法
                this.defindReactive(data,key,data[key])
            }
        }
    }
    defindReactive(obj,key,value){
        this.observer(value)    //如果一个数据是一个对象，也需要把这个对象中的数据变成响应式
        Object.defineProperty(obj,key,{
            // 当你获取school时，会调用get
            get(){
                // console.log('get...');
                return value
            },
            // 当你设置school时，会调用set
            set:(newVal)=>{
                // 当赋的值和老值一样，就不重新赋值
                if(newVal != value){
                    // console.log("set...")
                    this.observer(newVal)
                    value = newVal
                }
            }
        })
    }
}


class Compiler{
    constructor(el,vm){
        this.vm = vm
        this.el = this.isElementNode(el) ? el:document.querySelector(el)
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
        let value = this.getVal(vm,expr) 
        let fn = this.updater['modelUpdater']
        fn(node,value)
    },
    text(node,expr,vm){
        let content = expr.replace(/\{\{(.+?)\}\}/g,(...args)=>{
            return this.getVal(vm,args[1])
        })
        let fn = this.updater['textUpdater']
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
            // 把数据变成响应式   当new Observer，后school就变成了响应式数据
            new Observer(this.$data)
            //此时，数据就变成响应式的了
            console.log(this.$data) 
            new Compiler(this.$el,this)
        }
    }
}