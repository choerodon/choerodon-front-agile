import React, { Component } from 'react';
import { Icon, Popconfirm } from 'choerodon-ui';
import { AppState } from 'choerodon-front-boot';
import _ from 'lodash';
import UserHead from '../../UserHead';
import WYSIWYGEditor from '../../WYSIWYGEditor';
import { IssueDescription } from '../../CommonComponent';
import { delta2Html, text2Delta, beforeTextUpload, formatDate } from '../../../common/utils';
import { deleteCommit, updateCommit } from '../../../api/IssueApi';
import './Comment.scss';


class Comment extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      editCommentId: undefined,
      editComment: undefined,
      expand: false,
    };
  }

  componentDidMount() {
  }

  confirm(commentId, e) {
    this.handleDeleteCommit(commentId);
  }

  cancel(e) {
  }

  handleDeleteCommit(commentId) {
    deleteCommit(commentId)
      .then((res) => {
        this.props.onDeleteComment();
      });
  }

  handleUpdateComment(comment) {
    const { commentId, objectVersionNumber } = comment;
    const extra = {
      commentId,
      objectVersionNumber,
    };
    const updateCommentDes = this.state.editComment;
    if (updateCommentDes) {
      beforeTextUpload(updateCommentDes, extra, this.updateComment, 'commentText');
    } else {
      extra.commentText = '';
      this.updateComment(extra);
    }
  }

  updateComment = (comment) => {
    updateCommit(comment).then((res) => {
      this.setState({
        editCommentId: undefined,
        editComment: undefined,
      });
      this.props.onUpdateComment();
    });
  }

  render() {
    const commit = this.props.comment;
    const deltaEdit = text2Delta(this.state.editComment);
    return (
      <div
        className={`c7n-comment ${commit.commentId === this.state.editCommentId ? 'c7n-comment-focus' : ''}`}
      >
        <div className="line-justify">
          {
            this.state.expand ? (
              <Icon
                role="none"
                style={{ 
                  position: 'absolute',
                  left: 5,
                  top: 15,
                }}
                type="baseline-arrow_drop_down pointer"
                onClick={() => {
                  this.setState({
                    expand: false,
                  });
                }}
              />
            ) : null
          }
          {
            !this.state.expand ? (
              <Icon
                role="none"
                style={{ 
                  position: 'absolute',
                  left: 5,
                  top: 15,
                }}
                type="baseline-arrow_right pointer"
                onClick={() => {
                  this.setState({
                    expand: true,
                  });
                }}
              />
            ) : null
          }
          <div className="c7n-title-commit">
            <div style={{ marginRight: 19 }}>
              <UserHead
                user={{
                  id: commit.userId,
                  loginName: '',
                  realName: commit.userName,
                  avatar: commit.imageUrl,
                }}
                color={'#3f51b5'}
              />
            </div>
            <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>添加了评论</span>
          </div>
          <div className="c7n-action">
            <Icon
              role="none"
              type="mode_edit mlr-3 pointer"
              onClick={() => {
                this.setState({
                  editCommentId: commit.commentId,
                  editComment: commit.commentText,
                  expand: true,
                });
              }}
            />
            <Popconfirm
              title="确认要删除该评论吗?"
              placement="left"
              onConfirm={this.confirm.bind(this, commit.commentId)}
              onCancel={this.cancel}
              okText="删除"
              cancelText="取消"
              okType="danger"
            >
              <Icon
                // role="none"
                type="delete_forever mlr-3 pointer"
                // onClick={() => this.handleDeleteCommit(commit.commentId)}
              />
            </Popconfirm>
            {/* <Icon
              role="none"
              type="delete_forever mlr-3 pointer"
              onClick={() => this.handleDeleteCommit(commit.commentId)}
            /> */}
          </div>
        </div>
        <div className="line-start" style={{ color: 'rgba(0, 0, 0, 0.65)', marginTop: 2 }}>
          - {formatDate(commit.lastUpdateDate)}
        </div>
        {
          this.state.expand && (
            <div className="c7n-conent-commit" style={{ marginTop: 10 }}>
              {
                commit.commentId === this.state.editCommentId ? (
                  <WYSIWYGEditor
                    bottomBar
                    value={deltaEdit}
                    style={{ height: 200, width: '100%' }}
                    onChange={(value) => {
                      this.setState({ editComment: value });
                    }}
                    handleDelete={() => {
                      this.setState({
                        editCommentId: undefined,
                        editComment: undefined,
                      });
                    }}
                    handleSave={this.handleUpdateComment.bind(this, commit)}
                  />
                ) : (
                  <IssueDescription data={delta2Html(commit.commentText)} />
                )
              }
            </div>
          )
        }
        
      </div>
    );
  }
}

export default Comment;
