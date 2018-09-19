import Plain from 'slate-plain-serializer'
import { Block, Document, Inline, Leaf, Node, Text, Value } from 'slate'
import { Editor } from 'slate-react'
import { List, Map } from 'immutable'
import Automerge from 'automerge'
import React from 'react'

class AutomergeBlock extends Block {
  static fromAutomerge(object) {
    if (Block.isBlock(object)) {
      return object
    }

    const { data = {}, isVoid = false, nodes = [], type } = object
    const key = object._objectId

    if (typeof type !== 'string') {
      throw new Error('`AutomergeBlock.fromAutomerge` requires a `type` string.')
    }

    return new AutomergeBlock({
      key,
      type,
      isVoid: !!isVoid,
      data: new Map(data),
      nodes: new List(nodes.map(AutomergeNode.fromAutomerge)),
    })
  }
}

class AutomergeInline extends Inline {
  static fromAutomerge(object) {
    if (Inline.isInline(object)) {
      return object
    }

    const { data = {}, isVoid = false, nodes = [], type } = object
    const key = object._objectId

    if (typeof type !== 'string') {
      throw new Error('`AutomergeInline.fromAutomerge` requires a `type` string.')
    }

    return new AutomergeInline({
      key,
      type,
      isVoid: !!isVoid,
      data: new Map(data),
      nodes: new List(nodes.map(AutomergeNode.fromAutomerge)),
    })
  }
}

class AutomergeText extends Text {
  static fromAutomerge(object) {
    if (Text.isText(object)) {
      return object
    }

    const { leaves = [] } = object
    const key = object._objectId

    const characters = leaves
      .map(Leaf.fromJSON)
      .reduce((l, r) => l.concat(r.getCharacters()), new List())

    return new AutomergeText({ characters, key })
  }
}

class AutomergeNode extends Node {
  static fromAutomerge(value) {
    switch (value.object) {
      case 'block':
        return AutomergeBlock.fromAutomerge(value)
      case 'document':
        return AutomergeDocument.fromAutomerge(value)
      case 'inline':
        return AutomergeInline.fromAutomerge(value)
      case 'text':
        return AutomergeText.fromAutomerge(value)
      default: {
        throw new Error(
          `\`AutomergeNode.fromAutomerge\` requires an \`object\` of either 'block', 'document', 'inline' or 'text', but you passed: ${value}`
        )
      }
    }
  }
}

class AutomergeDocument extends Document {
  static fromAutomerge(object) {
    if (Document.isDocument(object)) {
      return object
    }

    const { data = {}, nodes = [] } = object
    const key = object._objectId

    return new AutomergeDocument({
      key,
      data: new Map(data),
      nodes: new List(nodes.map(AutomergeNode.fromAutomerge)),
    })
  }
}

class AutomergeValue extends Value {
  constructor(value) {
    // Deconstruct value since otherwise the Immutable.Record constructor
    // short-circuits object creation if value instanceof RecordType
    const { data, decorations, document, history, schema, selection } = value
    super({ data, decorations, document, history, schema, selection })
  }

  static fromJSON(object, options = {}) {
    let { data, document, selection, schema } = Value.fromJSON(object, options)
    const automergeDoc = Automerge.change(Automerge.init(), doc => doc.document = object.document)
    document = AutomergeDocument.fromAutomerge(automergeDoc.document)
    return new AutomergeValue({ data, document, selection, schema })
  }

  applyOperation(operation) {
    console.log('applyOperation', operation.toString())
    return new AutomergeValue(super.applyOperation(operation))
  }

  set(key, value) {
    return new AutomergeValue(super.set(key, value))
  }
}

export default class PlainText extends React.Component {
  state = {
    value: AutomergeValue.fromJSON(Plain.deserialize(
      'This is editable plain text, just like a <textarea>!',
      {toJSON: true}
    )),
  }

  onChange = ({ value }) => {
    console.log('setting state:', value)
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
