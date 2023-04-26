
export type Node ={
  readonly childNodes: Node[],
  readonly attributes: Map<string,string>
  readonly name:string,
  readonly textContent: string,
  parentNode:Node|null,
  setTextContent(input:string|number):Node,
  setAttribute(key:string,value:string|number):Node,
  appendChild(node:Node):Node,
  appendTo(node:Node):Node
  setPosition(input:{width?:number,height?:number,x?:number,y?:number}):Node,

  render():string
}

export function createNode( name:string ):Node {
  const childNodes =[] as Node[]
  const attributes =new Map<string,string>()
  let parentNode:Node|null =null
  let textContent:string|undefined =undefined

  return {
    get name() { return name },
    get childNodes() { return childNodes },
    get attributes() { return attributes },

    set parentNode( node ) { parentNode = node },
    get parentNode() { return parentNode },

    get textContent() { return textContent || "" },
    setTextContent(input: string|number ) {
      textContent =`${input}`
      return this
    },

    setAttribute(key:string,value:string|number) {
      attributes.set(key,`${value}`)
      return this
    },

    setPosition({x,y,width,height}) {
      x !== undefined && this.setAttribute("x",x)
      y !== undefined && this.setAttribute("y",y)
      width !== undefined && this.setAttribute("width",width)
      height !== undefined && this.setAttribute("height",height)
      return this
    },

    appendChild(node) {
      childNodes.push(node)
      node.parentNode =this
      return this
    },

    appendTo(node) {
      node.appendChild(this)
      return this
    },

    render() {
      const attributesRender =Array.from(this.attributes.entries()).map(([key,value]) => `${key}="${value}"`).join(" ")
      const hasAttributes =this.attributes.size > 0
      
      const childNodesRender =childNodes.map(node => node.render()).join("")
      return `<${name}${hasAttributes ? " " : ""}${attributesRender}>${childNodesRender}${textContent || ""}</${name}>`
    }
  }
}

export function createSvgNode(width:number,height:number) {
  const node =createNode("svg")
    .setPosition({width,height})
    .setAttribute("viewbox",`0 0 ${width} ${height}`)
    .setAttribute("xmlns","http://www.w3.org/2000/svg")
    .setAttribute("xmlns:xlink","http://www.w3.org/1999/xlink")
    .setAttribute("fill","none")
  
  const defs =createNode("defs")

  return {
    ...node,
    get defs() { return defs },
  }
}
