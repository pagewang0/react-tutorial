import React from 'react';
import ReactDOM from 'react-dom/client';
import classNames from 'classnames'
import './index.css';

function Square(props) {
  const { bold, highlight, p, onClick, value } = props

  return (
    <button className={
      classNames('square', {
        bold,
        highlight: highlight.includes(p)
      })
    }
      onClick={onClick}>
      {value}
    </button>
  )
}

function calculateWinner(squares, position = []) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      lines[i].forEach(p => position.push(p))
      return squares[a];
    }
  }
  return null;
}

class Board extends React.Component {
  renderSquare(x, y) {
    const key = x * 2 + y + x

    return <Square
      key={key}
      p={key}
      bold={this.props.bold[key]}
      value={this.props.squares[key]}
      highlight={this.props.highlight}
      onClick={() => this.props.onClick(key, x, y)} />;
  }

  renderColumn(row, height) {
    return Array.from({ length: height }, (item, column) => {
      return this.renderSquare(row, column)
    })
  }

  renderRow(width) {
    const { height, order } = this.props

    return Array.from({ length: width }, (item, row) => {
      return <div className="board-row"
        key={row}>
        {
          !order
          ? this.renderColumn(row, height)
          : this.renderColumn(row, height).reverse()
        }
      </div>
    })
  }

  render() {
    const { order, width } = this.props
    return (
      <div>{!order ? this.renderRow(width) : this.renderRow(width).reverse()}</div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      width: 3,
      height: 3,
      order: true, // asc: true/desc: false
      history: [
        {
          squares: Array(9).fill(null),
          bold: Array(9).fill(null),
          column: null,
          row: null,
        }
      ],
      stepNumber: 0,
      xIsNext: true,
    }
  }

  handleClick(i, row, column) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1)
    const current = history[history.length - 1]
    const squares = current.squares.slice()
    const bold = current.bold.slice()

    if (calculateWinner(squares) || squares[i]) {
      return
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O'

    bold.fill(null)
    bold[i] = true

    this.setState({
      history: history.concat([{
        squares,
        row,
        column,
        bold,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    })
  }

  handleSort() {
    const { order } = this.state

    this.setState({
      order: !order
    })
  }

  handleDraw(winer) {
    const { stepNumber, width, height } = this.state

    if (width * height === stepNumber && !winer) {
      return true
    }

    return false
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2 === 0)
    })
  }

  render() {
    const { history, width, height, order } = this.state
    const position = []

    const current = history[this.state.stepNumber]
    const winer = calculateWinner(current.squares, position)
    const draw = this.handleDraw(winer)

    const moves = history.map((step, move) => {
      const desc = move ? `Go to move #${move} (x: ${step.row} y: ${step.column})` : 'Go to game start'

      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      )
    })

    return (
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares}
            bold={current.bold}
            width={width}
            height={height}
            order={order}
            highlight={position}
            onClick={(i, x, y) => this.handleClick(i, x, y)} />
        </div>
        <div className="game-info">
          <div>{ winer ? `Winer: ${winer}` : draw ? 'Draw' : `Next player: ${this.state.xIsNext ? 'X' : 'O'}` }</div>
          <ol>{moves}</ol>
        </div>
        <div className="bar">
          <button onClick={() => this.handleSort()}>{order ? 'asc' : 'desc'}</button>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);
