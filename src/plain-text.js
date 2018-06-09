import Plain from 'slate-plain-serializer'
import { Block, Document, Inline, Leaf, Node, Text, Value } from 'slate'
import { Editor } from 'slate-react'
import { List, Map } from 'immutable'
import React from 'react'
import uuid from 'uuid/v4'

class AutomergeBlock extends Block {
  static fromJSON(object) {
    if (Block.isBlock(object)) {
      return object
    }

    const { data = {}, isVoid = false, key = uuid(), nodes = [], type } = object

    if (typeof type !== 'string') {
      throw new Error('`AutomergeBlock.fromJSON` requires a `type` string.')
    }

    return new AutomergeBlock({
      key,
      type,
      isVoid: !!isVoid,
      data: new Map(data),
      nodes: new List(nodes.map(AutomergeNode.fromJSON)),
    })
  }
}

class AutomergeInline extends Inline {
  static fromJSON(object) {
    if (Inline.isInline(object)) {
      return object
    }

    const { data = {}, isVoid = false, key = uuid(), nodes = [], type } = object

    if (typeof type !== 'string') {
      throw new Error('`AutomergeInline.fromJSON` requires a `type` string.')
    }

    return new AutomergeInline({
      key,
      type,
      isVoid: !!isVoid,
      data: new Map(data),
      nodes: new List(nodes.map(AutomergeNode.fromJSON)),
    })
  }
}

class AutomergeText extends Text {
  static fromJSON(object) {
    if (Text.isText(object)) {
      return object
    }

    const { leaves = [], key = uuid() } = object

    const characters = leaves
      .map(Leaf.fromJSON)
      .reduce((l, r) => l.concat(r.getCharacters()), new List())

    return new AutomergeText({ characters, key })
  }
}

class AutomergeNode extends Node {
  static fromJSON(value) {
    switch (value.object) {
      case 'block':
        return AutomergeBlock.fromJSON(value)
      case 'document':
        return AutomergeDocument.fromJSON(value)
      case 'inline':
        return AutomergeInline.fromJSON(value)
      case 'text':
        return AutomergeText.fromJSON(value)
      default: {
        throw new Error(
          `\`AutomergeNode.fromJSON\` requires an \`object\` of either 'block', 'document', 'inline' or 'text', but you passed: ${value}`
        )
      }
    }
  }
}

class AutomergeDocument extends Document {
  static fromJSON(object) {
    if (Document.isDocument(object)) {
      return object
    }

    const { data = {}, key = uuid(), nodes = [] } = object

    return new AutomergeDocument({
      key,
      data: new Map(data),
      nodes: new List(nodes.map(AutomergeNode.fromJSON)),
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
    document = AutomergeDocument.fromJSON(object.document)
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
