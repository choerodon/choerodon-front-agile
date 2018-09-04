import React, { Component } from 'react';
import { Icon } from 'choerodon-ui';
import './Card.scss';

class Card extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
  }

  render() {
    const {
      title, children, link,
    } = this.props;
    return (
      <div className="c7n-sprintDashboard-card">
        <div className="card-wrap">
          <header>
            <h1>
              <span>
                {title}
              </span>
            </h1>
            <span className="center" />
            <span>
              <Icon type="arrow_forward" />
            </span>
          </header>
          <section style={{ padding: '0 16px 1px' }}>
            {children}
          </section>
        </div>
      </div>
    );
  }
}
export default Card;
