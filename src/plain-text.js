import Plain from 'slate-plain-serializer'
import { Value } from 'slate'
import { Editor } from 'slate-react'
import React from 'react'

class AutomergeValue extends Value {
  constructor(value) {
    // Deconstruct value since otherwise the Immutable.Record constructor
    // short-circuits object creation if value instanceof RecordType
    const { data, decorations, document, history, schema, selection } = value
    super({ data, decorations, document, history, schema, selection })
  }

  static fromJSON(object, options = {}) {
    return new AutomergeValue(Value.fromJSON(object, options))
  }

  addMark(path, offset, length, mark) {
    console.log('addMark', path, offset, length, mark)
    return new AutomergeValue(super.addMark(path, offset, length, mark))
  }

  insertNode(path, node) {
    console.log('insertNode', path, node)
    return new AutomergeValue(super.insertNode(path, node))
  }

  insertText(path, offset, text, marks) {
    console.log('insertText', path, offset, text, marks)
    return new AutomergeValue(super.insertText(path, offset, text, marks))
  }

  mergeNode(path) {
    console.log('mergeNode', path)
    return new AutomergeValue(super.mergeNode(path))
  }

  moveNode(path, newPath, newIndex = 0) {
    console.log('moveNode', path, newPath, newIndex)
    return new AutomergeValue(super.moveNode(path, newPath, newIndex))
  }

  removeMark(path, offset, length, mark) {
    console.log('removeMark', path, offset, length, mark)
    return new AutomergeValue(super.removeMark(path, offset, length, mark))
  }

  removeNode(path) {
    console.log('removeNode', path)
    return new AutomergeValue(super.removeNode(path))
  }

  removeText(path, offset, text) {
    console.log('removeText', path, offset, text)
    return new AutomergeValue(super.removeText(path, offset, text))
  }

  setNode(path, properties) {
    console.log('setNode', path, properties)
    return new AutomergeValue(super.setNode(path, properties))
  }

  setMark(path, offset, length, mark, properties) {
    console.log('setMark', path, offset, length, mark, properties)
    return new AutomergeValue(super.setMark(path, offset, length, mark, properties))
  }

  setProperties(properties) {
    console.log('setProperties', properties)
    return new AutomergeValue(super.setProperties(properties))
  }

  setSelection(properties) {
    console.log('setSelection', properties)
    return new AutomergeValue(super.setSelection(properties))
  }

  splitNode(path, position, properties) {
    console.log('splitNode', path, position, properties)
    return new AutomergeValue(super.splitNode(path, position, properties))
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
