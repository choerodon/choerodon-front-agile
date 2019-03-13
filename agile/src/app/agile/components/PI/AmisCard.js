import React, { Component } from 'react';

class AimsCard extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {showLine, lineColor, pointColor, amisCategory, planBVShow, actualBVShow, amisInfo} = this.props;
    return (
      <div>
        {
          showLine && (
            <div style={{ background: lineColor}}></div>
          )
          <div>
            <table>
              <thead>
                <th>
                  <td colSpan={planBVShow && actualBVShow ? 1 : 3}>{amisCategory}</td>
                  {
                    planBVShow && (<td><span style={{ width: 5, height: 5, borderRadius: '50%', background: {pointColor}}}></span>计划BV</td>)
                  }
                  {
                    actualBVShow && (<td>实际BV</td>)
                  }
                </th>
              </thead>
              <tbody>
                {
                  amisInfo && amisInfo.map(item => {
                  return (
                    <tr>
                      <td>{item.name}</td>
                      <td>{item.plannedBusinessValue}</td>
                      <td>{item.actualdBusinessValue}</td>
                    </tr>
                  )
                  })
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    );
  }
}

export default AimsCard;
