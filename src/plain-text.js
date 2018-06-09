import Plain from 'slate-plain-serializer'
import { Value } from 'slate'
import { Editor } from 'slate-react'

import React from 'react'

/*function wrapValue(value) {
  value.applyOperation = function (...args) {
    const [ operation ] = args
    console.log('applyOperation', operation.toString())
    return wrapValue(Value.prototype.applyOperation.apply(this, args))
  }

  value.set = function (...args) {
    console.log('set', args)
    return wrapValue(Value.prototype.set.apply(this, args))
  }

  return value
}*/

class AutomergeValue extends Value {
  constructor(value) {
    // Deconstruct value since otherwise the Immutable.Record constructor
    // short-circuits object creation if value instanceof RecordType
    const { data, decorations, document, history, schema, selection } = value
    super({ data, decorations, document, history, schema, selection })
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
    value: new AutomergeValue(Plain.deserialize(
      'This is editable plain text, just like a <textarea>!'
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
