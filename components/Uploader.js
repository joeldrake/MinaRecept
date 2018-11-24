import React, { Component } from 'react';
import uploadcare from 'uploadcare-widget';

class Uploader extends Component {
  componentDidMount() {
    const widget = uploadcare.Widget(this.uploader);

    if (typeof this.props.onChange === 'function') {
      widget.onChange(this.props.onChange);
    }
    if (typeof this.props.onUploadComplete === 'function') {
      widget.onUploadComplete(this.props.onUploadComplete);
    }
    widget.onDialogOpen(dialog => (this.dialog = dialog));
  }

  componentWillUnmount() {
    if (this.dialog) {
      this.dialog.reject();
    }
  }

  getInputAttributes() {
    const attributes = Object.assign({}, this.props);

    delete attributes.value;
    delete attributes.onChange;
    delete attributes.onUploadComplete;

    return attributes;
  }

  render() {
    const attributes = this.getInputAttributes();

    return (
      <input
        type="hidden"
        ref={input => (this.uploader = input)}
        {...attributes}
      />
    );
  }
}

export default Uploader;
