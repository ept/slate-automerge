import Plain from 'slate-plain-serializer'
import { Block, Document, Inline, Leaf, Text, Value } from 'slate'
import { Editor } from 'slate-react'
import React from 'react'

function createNode(node) {
  if (node instanceof AMBlock || node instanceof AMDocument ||
      node instanceof AMInline || node instanceof AMText) {
    return node
  }

  switch (node.object) {
    case 'block':
      return AMBlock.fromJSON(node)
    case 'document':
      return AMDocument.fromJSON(node)
    case 'inline':
      return AMInline.fromJSON(node)
    case 'text':
      return AMText.fromJSON(node)
    default:
      throw new Error('createNode requires an `object` property')
  }
}

class AMBlock extends Block {
  constructor(block) {
    // Deconstruct value since otherwise the Immutable.Record constructor
    // short-circuits object creation if value instanceof RecordType
    const { data, key, nodes, type } = block
    super({ data, key, nodes, type })
  }

  static fromJSON(object) {
    let { data, key, nodes, type } = Block.fromJSON(object)
    nodes = nodes.map(createNode)
    return new AMBlock({ data, key, nodes, type })
  }

  set(key, value) {
    if (key === 'nodes') {
      value = value.map(createNode)
    }
    return new AMBlock(super.set(key, value))
  }
}

class AMInline extends Inline {
  constructor(inline) {
    // Deconstruct value since otherwise the Immutable.Record constructor
    // short-circuits object creation if value instanceof RecordType
    const { data, key, nodes, type } = inline
    super({ data, key, nodes, type })
  }

  static fromJSON(object) {
    let { data, key, nodes, type } = Inline.fromJSON(object)
    nodes = nodes.map(createNode)
    return new AMInline({ data, key, nodes, type })
  }

  set(key, value) {
    if (key === 'nodes') {
      value = value.map(createNode)
    }
    return new AMInline(super.set(key, value))
  }
}

class AMText extends Text {
  constructor(text) {
    // Deconstruct value since otherwise the Immutable.Record constructor
    // short-circuits object creation if value instanceof RecordType
    const { leaves, key } = text
    super({ leaves, key })
  }

  static fromJSON(object) {
    let { leaves, key } = Text.fromJSON(object)
    leaves = leaves.map(AMLeaf.fromJSON)
    return new AMText({ leaves, key })
  }

  set(key, value) {
    if (key === 'leaves') {
      value = value.map(AMLeaf.create)
    }
    return new AMText(super.set(key, value))
  }
}

class AMLeaf extends Leaf {
  constructor(leaf) {
    // Deconstruct value since otherwise the Immutable.Record constructor
    // short-circuits object creation if value instanceof RecordType
    const { marks, text } = leaf
    //console.log('leaf:', text)
    super({ marks, text })
  }

  static fromJSON(object) {
    return new AMLeaf(Leaf.fromJSON(object))
  }

  static create(object) {
    if (object instanceof AMLeaf) {
      return object
    } else {
      return new AMLeaf(object)
    }
  }

  set(key, value) {
    return new AMLeaf(super.set(key, value))
  }
}

class AMDocument extends Document {
  constructor(doc) {
    // Deconstruct value since otherwise the Immutable.Record constructor
    // short-circuits object creation if value instanceof RecordType
    const { data, key, nodes } = doc
    super({ data, key, nodes })
  }

  static fromJSON(object) {
    let { data, key, nodes } = Document.fromJSON(object)
    nodes = nodes.map(createNode)
    return new AMDocument({ data, key, nodes })
  }

  static create(object) {
    if (object instanceof AMDocument) {
      return object
    } else {
      return new AMDocument(object)
    }
  }

  set(key, value) {
    if (key === 'nodes') {
      value = value.map(createNode)
    }
    return new AMDocument(super.set(key, value))
  }
}

class AMValue extends Value {
  constructor(value) {
    // Deconstruct value since otherwise the Immutable.Record constructor
    // short-circuits object creation if value instanceof RecordType
    const { data, decorations, document, history, schema, selection } = value
    super({ data, decorations, document, history, schema, selection })
  }

  static fromJSON(object, options = {}) {
    let { data, decorations, document, history, schema, selection } = Value.fromJSON(object, options)
    document = AMDocument.fromJSON(document)
    return new AMValue({ data, decorations, document, history, schema, selection })
  }

  static create(object) {
    if (object instanceof AMValue) {
      return object
    } else {
      return new AMValue(object)
    }
  }

  addMark(path, offset, length, mark) {
    console.log('addMark', path, offset, length, mark)
    return AMValue.create(super.addMark(path, offset, length, mark))
  }

  insertNode(path, node) {
    console.log('insertNode', path, node)
    return AMValue.create(super.insertNode(path, node))
  }

  insertText(path, offset, text, marks) {
    const pathLog = path.toJS ? path.toJS() : path
    const marksLog = marks.toJS ? marks.toJS() : marks
    console.log('insertText', pathLog, ',', offset, ',', text, ',', marksLog)
    return AMValue.create(super.insertText(path, offset, text, marks))
  }

  mergeNode(path) {
    const pathLog = path.toJS ? path.toJS() : path
    console.log('mergeNode', pathLog)
    return AMValue.create(super.mergeNode(path))
  }

  moveNode(path, newPath, newIndex = 0) {
    console.log('moveNode', path, newPath, newIndex)
    return AMValue.create(super.moveNode(path, newPath, newIndex))
  }

  removeMark(path, offset, length, mark) {
    console.log('removeMark', path, offset, length, mark)
    return AMValue.create(super.removeMark(path, offset, length, mark))
  }

  removeNode(path) {
    console.log('removeNode', path)
    return AMValue.create(super.removeNode(path))
  }

  removeText(path, offset, text) {
    const pathLog = path.toJS ? path.toJS() : path
    console.log('removeText', pathLog, ',', offset, ',', text)
    return AMValue.create(super.removeText(path, offset, text))
  }

  setNode(path, properties) {
    console.log('setNode', path, properties)
    return AMValue.create(super.setNode(path, properties))
  }

  setMark(path, offset, length, mark, properties) {
    console.log('setMark', path, offset, length, mark, properties)
    return AMValue.create(super.setMark(path, offset, length, mark, properties))
  }

  setProperties(properties) {
    console.log('setProperties', properties)
    return AMValue.create(super.setProperties(properties))
  }

  setSelection(properties) {
    console.log('setSelection', properties)
    return AMValue.create(super.setSelection(properties))
  }

  splitNode(path, position, properties) {
    const pathLog = path.toJS ? path.toJS() : path
    console.log('splitNode', pathLog, ',', position, ',', properties)
    return AMValue.create(super.splitNode(path, position, properties))
  }

  set(key, value) {
    if (key === 'document') {
      value = AMDocument.create(value)
    }
    return AMValue.create(super.set(key, value))
  }
}

export default class PlainText extends React.Component {
  state = {
    value: AMValue.fromJSON(Plain.deserialize(
      'This is editable plain text, just like a <textarea>!',
      {toJSON: true}
    )),
  }

  onChange = ({ value }) => {
    //console.log('setting state:', value)
    this.setState({ value })
  }

  render() {
    return (
      <div className="editor">
        <Editor
          placeholder="Enter some plain text..."
          value={this.state.value}
          onChange={this.onChange}
        />
      </div>
    )
  }
}
