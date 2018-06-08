import React, { Component } from 'react';
import { Select, Icon } from 'choerodon-ui';
import './ReadAndEdit.scss';

const Option = Select.Option;

class ReadAndEdit extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      type: 'read',
      origin: '',
    };
  }

  componentWillMount() {
    this.saveShow();
  }

  componentDidMount() {
    window.addEventListener('keyup', this.handleEnter, false);
    window.addEventListener('click', (e) => {
      // window.console.log(e.target.className);
      // if (this.state.type === 'edit') {
      //   e.stopPropagation();
      //   this.props.onCancel(this.state.origin);
      //   this.setState({
      //     type: 'read',
      //     origin: this.props.origin,
      //   });
      // }
    });
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleEnter, false);
  }

  onBlur() {
    this.setState({ type: 'read' });
  }

  handleEnter = (e) => {
    // if (this.props.handleEnter && e.keyCode === 13) {
    //   e.stopPropagation();
    //   this.setState({ type: 'read' });
    //   this.props.onOk();
    // }
  }

  saveShow() {
    this.setState({
      origin: this.props.origin,
    });
  }

  render() {
    // const realProps = { ...this.props, user: undefined };
    // return <Select {...realProps}>{options}</Select>;
    return (
      <div
        role="none"
        className={`rae ${this.props.current !== this.props.thisType ? 'c7n-readAndEdit' : ''}`}
        style={{
          position: 'relative',
          width: this.props.line ? '100%' : 'auto',
        }}
        // onClick={() => {
        //  this.setState({
        //    type: 'edit',
        //    origin: this.props.origin,
        //  });
        //  if (this.props.onInit) {
        //    this.props.onInit();
        //  }
        //  if (this.props.callback) {
        //    this.props.callback(this.props.thisType);
        //  }
        // }}
      >
        {
          this.props.current !== this.props.thisType && (
            <div
              role="none"
              onClick={() => {
                this.setState({
                  type: 'edit',
                  origin: this.props.origin,
                });
                if (this.props.onInit) {
                  this.props.onInit();
                }
                if (this.props.callback) {
                  this.props.callback(this.props.thisType);
                }
              }}
            >
              <span
                className="edit"
                style={{
                  display: 'none',
                  lineHeight: '20px',
                }}
              >
                <Icon type="mode_edit" />
              </span>
              {this.props.readModeContent}
            </div>
          )
        }
        {/* {
          (this.props.current !== this.props.thisType) && (
            <span
              className="edit"
              style={{
                display: 'none',
              }}
            >
              <Icon type="mode_edit" />
            </span>
          )
        }
        
        {
          (this.props.current !== this.props.thisType) && 
            (this.props.readModeContent)
        } */}
        {
          (this.props.current === this.props.thisType) && (
            <section>
              {this.props.children}
            </section>
          )
        }
        {
          (this.props.current === this.props.thisType) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div 
                style={{ 
                  // background: '#f0f0f0',
                  // border: '1px solid #ccc',
                  // borderTop: 'none',
                  // borderRadius: '0 0 3px 3px',
                  // outline: 'none',
                  // padding: '3px', 
                  // boxShadow: '0 3px 6px rgba(111,111,111,0.2)',
                }}
              >
                <span
                  className="edit-edit"
                  style={{
                    display: 'block-inline',
                    marginRight: '4px',
                    width: 20,
                    height: 20,
                    lineHeight: '16px',
                  }}
                  role="none"
                  onClick={(e) => {
                    e.stopPropagation();
                    this.setState({ type: 'read' });
                    this.props.onOk();
                    this.props.callback(undefined);
                  }
                  }
                >
                  <Icon style={{ fontSize: '14px' }} type="check" />
                </span>
                <span
                  className="close"
                  style={{
                    display: 'block-inline',
                    width: 20,
                    height: 20,
                    lineHeight: '16px',
                  }}
                  role="none"
                  onClick={(e) => {
                    e.stopPropagation();
                    this.props.onCancel(this.state.origin);
                    this.setState({
                      type: 'read',
                      origin: this.props.origin,
                    });
                    this.props.callback(undefined);
                  }
                  }
                >
                  <Icon style={{ fontSize: '14px' }} type="close" />
                </span>
              </div>
            </div>
          )
        }
      </div>
    );
  }
}

export default ReadAndEdit;
