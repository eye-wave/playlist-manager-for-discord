export type Node = {
  // readonly childNodes: Node[]
  // readonly name: string
  // readonly text: string
  readonly attrs: Map<string, string>
  parent: Node | null
  setText(input: string | number): Node
  setAttr(key: string, value: string | number): Node
  append(node: Node): Node
  appendTo(node: Node): Node
  setPosition(input: { width?: number; height?: number; x?: number; y?: number }): Node

  render(): string
}

export function createNode(name: string): Node {
  const childNodes = [] as Node[]
  const attributes = new Map<string, string>()
  let parentNode: Node | null = null
  let textContent: string | undefined = undefined

  return {
    // get name() {
    //   return name
    // },
    // get childNodes() {
    //   return childNodes
    // },
    get attrs() {
      return attributes
    },

    set parent(node) {
      parentNode = node
    },
    get parent() {
      return parentNode
    },

    // get text() {
    //   return textContent || ""
    // },
    setText(input: string | number) {
      textContent = `${input}`
      return this
    },

    setAttr(key: string, value: string | number) {
      attributes.set(key, `${value}`)
      return this
    },

    setPosition({ x, y, width, height }) {
      x !== undefined && this.setAttr("x", x)
      y !== undefined && this.setAttr("y", y)
      width !== undefined && this.setAttr("width", width)
      height !== undefined && this.setAttr("height", height)
      return this
    },

    append(node) {
      childNodes.push(node)
      node.parent = this
      return this
    },

    appendTo(node) {
      node.append(this)
      return this
    },

    render() {
      const attributesRender = Array.from(this.attrs.entries())
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ")
      const hasAttributes = this.attrs.size > 0

      const childNodesRender = childNodes.map(node => node.render()).join("")
      return `<${name}${hasAttributes ? " " : ""}${attributesRender}>${childNodesRender}${textContent || ""}</${name}>`
    },
  }
}

export function createSvgNode(width: number, height: number) {
  const node = createNode("svg")
    .setPosition({ width, height })
    .setAttr("viewbox", `0 0 ${width} ${height}`)
    .setAttr("xmlns", "http://www.w3.org/2000/svg")
    .setAttr("xmlns:xlink", "http://www.w3.org/1999/xlink")
    .setAttr("fill", "none")

  const defs = createNode("defs")

  return {
    ...node,
    get defs() {
      return defs
    },
  }
}
