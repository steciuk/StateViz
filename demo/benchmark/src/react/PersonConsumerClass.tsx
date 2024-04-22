import React, { Component } from "react";
import { AgeContext } from "./contexts/AgeContext";
import { NameContext } from "./contexts/NameContext";

export class PersonConsumerClass extends Component {
  static contextType = NameContext;

  render() {
    const [name, updateName] = this.context as [string, (name: string) => void];
    return (
      <>
        <div>
          <h2>PersonConsumerClass</h2>
          <p>Name: {name}</p>
          <AgeContext.Consumer>
            {(ageCtx) => <p>Age: {ageCtx?.[0] ?? NaN}</p>}
          </AgeContext.Consumer>
        </div>

        <div>
          <label>Name: </label>
          <input
            type="text"
            onChange={(e) => updateName(e.target.value)}
            value={name}
          />
          <label>Age: </label>
          <AgeContext.Consumer>
            {(ageCtx) => (
              <input
                type="number"
                onChange={(e) => ageCtx?.[1](parseInt(e.target.value))}
                value={ageCtx?.[0] ?? NaN}
              />
            )}
          </AgeContext.Consumer>
        </div>
      </>
    );
  }
}
