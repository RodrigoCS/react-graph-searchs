import React, { Component } from 'react'
import { observable, action, computed, toJS } from 'mobx'
import { observer } from 'mobx-react'
import styled, { css } from 'styled-components'
import _ from 'lodash'
import map from './assets/map.png'
import './App.css'

class Graph {
  @observable currentNodeKey = ''

  queue = []
  stack = []
  visited = []
  found = false
  depth = 0
  iterations = 0

  @observable
  nodes = {
    E1: {
      isEntrance: true,
      measure: {
        top: 511,
        left: 75
      },
      relations: ['E2', 'E3', 'J', 'I']
    },
    E2: {
      isEntrance: true,
      measure: {
        top: 490,
        left: 207
      },
      relations: ['E1', 'E3', 'J', 'F', 'R']
    },
    E3: {
      isEntrance: true,
      measure: {
        left: 672,
        top: 492
      },
      relations: ['E1', 'E2', 'A', 'P', 'R']
    },
    A: {
      measure: {
        width: 110,
        height: 62,
        left: 563,
        top: 336
      },
      relations: ['E3', 'B', 'D', 'P']
    },
    B: {
      measure: {
        left: 467,
        top: 220,
        width: 64,
        height: 208
      },
      relations: ['A', 'C', 'D', 'F', 'R']
    },
    C: {
      measure: {
        left: 390,
        top: 346,
        borderTopLeftRadius: '35%',
        borderBottomLeftRadius: '35%',
        height: 65,
        width: 68
      },
      relations: ['B', 'F', 'R']
    },
    D: {
      measure: {
        left: 347,
        top: 125,
        width: 242,
        height: 62
      },
      relations: ['A', 'B', 'E', 'F', 'K', 'L', 'O', 'P']
    },
    E: {
      measure: {
        width: 117,
        height: 105,
        left: 168,
        top: 83
      },
      relations: ['D', 'F', 'G', 'H', 'I', 'K', 'L']
    },
    F: {
      measure: {
        left: 275,
        top: 208,
        width: 46,
        height: 209
      },
      relations: ['B', 'C', 'D', 'E', 'G', 'J']
    },
    G: {
      measure: {
        left: 204,
        top: 210,
        width: 27,
        height: 90
      },
      relations: ['E', 'F', 'H', 'J']
    },
    H: {
      measure: {
        left: 148,
        top: 225,
        width: 20,
        height: 59
      },
      relations: ['E', 'G', 'I', 'J']
    },
    I: {
      measure: {
        left: 60,
        top: 127,
        width: 50,
        transform: 'rotate(15deg)',
        height: 23
      },
      relations: ['E1', 'E', 'H']
    },
    J: {
      measure: {
        top: 326,
        left: 150,
        width: 70,
        height: 143
      },
      relations: ['E1', 'E2', 'F', 'G', 'H']
    },
    K: {
      measure: {
        top: 81,
        left: 297,
        width: 14,
        height: 18
      },
      relations: ['D', 'E', 'F', 'L']
    },
    L: {
      measure: {
        top: 32,
        left: 333,
        width: 116,
        height: 67
      },
      relations: ['D', 'E', 'K', 'O']
    },
    O: {
      measure: {
        left: 472,
        top: 73,
        width: 59,
        height: 22
      },
      relations: ['D', 'L', 'P']
    },
    P: {
      measure: {
        top: 74,
        left: 570,
        width: 31,
        height: 22
      },
      relations: ['E3', 'A', 'D', 'O']
    },
    R: {
      measure: {
        top: 459,
        left: 467,
        width: 27,
        height: 35
      },
      relations: ['E2', 'E3', 'A', 'B', 'C']
    }
  }

  @computed
  get currentNode() {
    return toJS(this.nodes[this.currentNodeKey])
  }

  @computed
  get searchableNodes() {
    return toJS(this.nodes)
  }
  @computed
  get isFirstRun() {
    return _.filter(this.nodes, n => n.visited).length === 0
  }

  @action
  setCurrentKey = key => {
    this.currentNodeKey = key
    this.clearSearch()
    const updated = _.mapValues(this.nodes, (node, key) => {
      const found = this.currentNode.relations.filter(
        relation => relation == key
      ).length
      if (!!found) {
        return { ...node, collides: true }
      } else {
        return { ...node, collides: false }
      }
    })
    console.log({ updated })

    this.nodes = { ...updated }
  }

  @action
  setFrom = fromKey => {
    const updated = _.mapValues(this.nodes, (node, key) => {
      if (fromKey == key) {
        return { ...node, from: true }
      } else {
        return { ...node, from: false }
      }
    })
    this.nodes = { ...updated }
  }

  @action
  setTo = setKey => {
    const updated = _.mapValues(this.nodes, (node, key) => {
      if (setKey == key) {
        return { ...node, to: true }
      } else {
        return { ...node, to: false }
      }
    })
    this.nodes = { ...updated }
  }

  @action
  initDFS = (start, finish) => {
    this.stack.push(start)
    const popped = this.stack.pop()
    this.DFS(popped, finish)
  }

  @action
  DFS = (node, finish) => {
    if (this.found) return
    if (this.nodes[node] == null) return
    if (!!this.nodes[node].visited) return
    this.setVisited(node)
    if (node == finish) {
      this.found = true
      return alert(`Encontrado ${node}`)
    }

    const relations = _.difference(
      _.difference(this.nodes[node].relations, this.stack),
      this.visited
    )
    this.stack = [...this.stack, ...relations]
    const popped = this.stack.pop()
    this.DFS(popped, finish)
  }

  @action
  initBFS = (start, finish) => {
    this.stack.push(start)
    const shifted = this.stack.shift()
    this.BFS(shifted, finish)
  }

  @action
  BFS = (node, finish) => {
    if (this.found) return
    if (this.nodes[node] == null) return
    if (!!this.nodes[node].visited) return
    this.setVisited(node)
    if (node == finish) {
      this.found = true
      return alert(`found ${node}`)
    }
    const relations = _.difference(
      _.difference(this.nodes[node].relations, this.stack),
      this.visited
    )
    this.stack = [...this.stack, ...relations]
    const shifted = this.stack.shift()
    this.DFS(shifted, finish)
  }

  @action
  initIDS = (start, finish) => {
    this.stack.push(start)
    const popped = this.stack.pop()
    this.IDS(popped, finish)
  }

  @action
  IDS = (node, finish) => {
    if (this.found) return
    if (this.nodes[node] == null) return
    if (!!this.nodes[node].visited) return
    if (this.nodes[node].depth == this.depth) return
    this.setVisited(node)
    if (node == finish) {
      this.found = true
      return alert(`Encontrado ${node}`)
    }
    if (this.depth < this.nodes[node].depth) {
      return alert(`No se encontro en el nivel ${this.depth}`)
    }
    const relations = _.difference(
      _.difference(this.nodes[node].relations, this.stack),
      this.visited
    )

    this.setDepthToNodes(relations)

    this.stack = [...this.stack, ...relations]
    const popped = this.stack.pop()
    this.iterations = this.iterations + 1
    this.IDS(popped, finish)
  }

  @action
  setDepthToNodes = nodes => {
    nodes.forEach(node => {
      this.nodes[node].depth = this.iterations
    })

    this.nodes = { ...this.nodes }
  }

  @action
  setVisited = n => {
    console.log('VISITED', n)
    this.visited.push(n)
    this.nodes[n].visited = true
    this.nodes[n].searchIndex = this.visited.length
    this.nodes = { ...this.nodes }
  }

  @action
  setDepthLevel = level => {
    this.depth = level
  }

  @action
  clearNavigation = () => {
    const cleared = _.mapValues(this.nodes, (node, key) => {
      return { ...node, collides: false }
    })
    this.nodes = { ...cleared }
    this.currentNodeKey = ''
  }

  @action
  clearSearch = () => {
    const cleared = _.mapValues(this.nodes, (node, key) => {
      return { ...node, from: false, to: false, visited: false }
    })
    this.nodes = { ...cleared }
  }
}

@observer
class App extends Component {
  constructor() {
    super()
    this.graph = new Graph()
  }

  handleClick = (node, key) => {
    console.log({ node, key })
    if (!this.graph.currentNodeKey) {
      if (node.isEntrance) {
        this.graph.setCurrentKey(key)
      } else {
        alert('Selecciona una entrada')
      }
    } else {
      if (node.collides) {
        this.graph.setCurrentKey(key)
      }
    }
  }
  handleFromChange = e => {
    const value = e.target.value
    this.graph.clearNavigation()
    this.from = value
    this.graph.setFrom(value)
  }

  handleToChange = e => {
    const value = e.target.value
    this.graph.clearNavigation()
    this.to = value
    this.graph.setTo(value)
  }

  handleDepthLevelChange = e => {
    const level = e.target.value
    this.graph.setDepthLevel(level)
  }

  handleBFSClick = () => {
    if (!this.to || !this.from) {
      alert('Selecciona de donde a donde quieres ir.')
    } else {
      const search = this.graph.initBFS(this.from, this.to)
      console.log({ search })
    }
  }

  handleDFSClick = () => {
    if (!this.to || !this.from) {
      alert('Selecciona de donde a donde quieres ir.')
    } else {
      const search = this.graph.initDFS(this.from, this.to)
      console.log({ search })
    }
  }

  handleIDSClick = () => {
    if (!this.to || !this.from) {
      alert('Selecciona de donde a donde quieres ir.')
    } else {
      const search = this.graph.initIDS(this.from, this.to)
      console.log({ search })
    }
  }

  render() {
    return (
      <Container>
        <div>
          <Map>
            {_.map(this.graph.nodes, (node, key) => {
              return (
                <Building
                  onClick={() => {
                    this.handleClick(node, key)
                  }}
                  style={node.measure}
                  selected={key == this.graph.currentNodeKey}
                  collides={!!node.collides}
                  from={!!node.from}
                  to={!!node.to}
                  visited={node.visited}
                >
                  {key}
                  <SearchIndex>{node.searchIndex}</SearchIndex>
                </Building>
              )
            })}
          </Map>
        </div>

        <div>
          <Row>
            <Select onChange={this.handleFromChange}>
              <option value="" disabled selected>
                Ir de ...
              </option>
              {_.map(this.graph.nodes, (node, key) => <option>{key}</option>)}
            </Select>
            <Select onChange={this.handleToChange}>
              <option value="" disabled selected>
                ... a
              </option>
              {_.map(this.graph.nodes, (node, key) => <option>{key}</option>)}
            </Select>
          </Row>
          <Row>
            <Button onClick={this.handleBFSClick}>Busqueda por amplitud</Button>
            <Button onClick={this.handleDFSClick}>
              Busqueda por profundidad
            </Button>
          </Row>
          <Row>
            <Input
              onChange={this.handleDepthLevelChange}
              placeholder={'Nivel de profundidad'}
              type={'number'}
            />
            <Button onClick={this.handleIDSClick}>
              Busqueda por profundidad iterativa
            </Button>
          </Row>
        </div>
      </Container>
    )
  }
}

const Container = styled.div`
  display: flex;
  flex: 1;
  max-height: 100vh;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const Building = styled.div`
  background: #9e9e9e;
  position: absolute;
  border: 2px solid black;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: bolder;
  color: white;
  &:hover {
    cursor: pointer;
  }
  ${props =>
    props.selected &&
    css`
      background-color: #ff9800;
    `};
  ${props =>
    props.collides &&
    css`
      background-color: #03a9f499;
      &:hover {
        background-color: #03a9f4;
      }
    `};
  ${props =>
    props.visited &&
    css`
      background-color: pink;
    `};
  ${props =>
    props.from &&
    css`
      background-color: #f44336;
    `};
  ${props =>
    props.to &&
    css`
      background-color: #4caf50;
    `};
`

const Map = styled.div`
  background-image: url('${map}');
  background-size: contain;
  background-repeat: no-repeat;
  width: 768px;
  height: 576px;
  position: relative;
`

const Select = styled.select`
  width: 100%;
  padding: 6px;
  height: 28px;
  border-radius: 2px;
  border: 1px solid #9e9e9e;
  color: #9e9e9e;
  margin-right: 6px;
  &:focus {
    outline: none;
    border: 1px solid #03a9f4;
  }
`

const Button = styled.button`
  padding: 6px 12px;
  border-radius: 2px;
  border: 1px solid #ff9800;
  background: #ff9800;
  color: white;
  margin-right: 6px;

  &:hover {
    cursor: pointer;
    background: #ff980099;
  }
  &:focus {
    outline: none;
  }
`

const SearchIndex = styled.div`
  color: black;
  font-size: 10px;
`

const Input = styled.input`
  padding: 6px;
  border-radius: 2px;
  border: 1px solid #9e9e9e;
  color: #9e9e9e;
  margin-right: 6px;
  &:focus {
    outline: none;
    border: 1px solid #03a9f4;
  }
`

const Row = styled.div`
  display: flex;
  flex-direction: row;
  margin: 10px 0;
`
export default App
