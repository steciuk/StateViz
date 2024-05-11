import { Component } from "react";

export class ClassComponent extends Component<
  { name: string },
  { counter: number }
> {
  constructor(props: { name: string }) {
    super(props);
    this.state = { counter: 0 };
  }

  render() {
    return (
      <div>
        <h2>{this.props.name}</h2>
        <button
          onClick={() => this.setState({ counter: this.state.counter + 1 })}
        >
          Increment
        </button>
        <p>Counter: {this.state.counter}</p>
      </div>
    );
  }
}
