import React, { Component } from 'react';
import { Select, Icon } from 'choerodon-ui';
import './ReadAndEdit.scss';

const { Option } = Select;

class ReadAndEdit extends Component {
  // constructor(props, context) {
  //   super(props, context);
  //   // this.state = {
  //   //   type: 'read',
  //   //   origin: '',
  //   // };
  // }

  // componentWillMount() {
  //   this.saveShow();
  // }

  componentDidMount() {
    window.addEventListener('keyup', this.handleEnter, false);
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleEnter, false);
  }


  handleEnter = (e) => {
    const { handleEnter, current } = this.props;
    if (handleEnter && e.keyCode === 13 && document.getElementsByClassName(current).length
    ) {
      document.getElementsByClassName(current)[0].click();
    }
  }

  saveShow() {
    // const { origin } = this.props;
    // this.setState({
    //   origin,
    // });
  }

  render() {
    const {
      current, thisType, style, line,
      origin, onInit, callback, children,
      readModeContent, onOk, onCancel,
    } = this.props;
    return (
      <div
        role="none"
        className={`rae ${current !== thisType ? 'c7n-readAndEdit' : ''}`}
        style={{
          ...style,
          position: 'relative',
          width: line ? '100%' : 'auto',
        }}
      >
        {
          current !== thisType && (
            <div
              role="none"
              onClick={() => {
                // this.setState({
                //   type: 'edit',
                //   origin,
                // });
                if (onInit) {
                  onInit();
                }
                if (callback) {
                  callback(thisType);
                }
              }}
            >
              <span
                className="edit"
                style={{
                  display: 'none',
                  lineHeight: '20px',
                  alignItems: 'center',
                }}
              >
                <Icon type="mode_edit" />
              </span>
              {readModeContent}
            </div>
          )
        }
        {
          (current === thisType) && (
            <section>
              {children}
            </section>
          )
        }
        {
          (current === thisType) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.08)',
                }}
              >
                <span
                  className={`${current} edit-edit`}
                  style={{
                    display: 'block-inline',
                    marginRight: '4px',
                    width: 20,
                    height: 20,
                    lineHeight: '16px',
                  }}
                  role="none"
                  onClick={(e) => {
                    debugger;
                    e.stopPropagation();
                    // this.setState({ type: 'read' });
                    onOk();
                    callback(undefined);
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
                    onCancel(origin);
                    // this.setState({
                    //   type: 'read',
                    //   origin,
                    // });
                    callback(undefined);
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
