import React, { Component } from 'react'
import { observable, action, computed, toJS } from 'mobx'
import { observer } from 'mobx-react'
import styled, { css } from 'styled-components'
import _ from 'lodash'
import map from './assets/map.png'
import './App.css'

const getDistance = (startCoords, finishCoords) => {
  const { x: x1, y: y1 } = startCoords
  const { x: x2, y: y2 } = finishCoords
  console.log({ startCoords, finishCoords })
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

const getArea = (width, height) => {
  return width * height
}

const getRandomColor = () => {
  let letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

class Graph {
  @observable currentNodeKey = ''
  @observable totalCost = 0

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
        left: 75,
        width: 50,
        height: 50
      },
      relations: [
        { name: 'E2', cost: 2 },
        { name: 'E3', cost: 4 },
        { name: 'J', cost: 1 },
        { name: 'I', cost: 3 }
      ]
    },
    E2: {
      isEntrance: true,
      measure: {
        top: 490,
        left: 207,
        width: 50,
        height: 50
      },
      relations: [
        { name: 'E1', cost: 2 },
        { name: 'E3', cost: 5 },
        { name: 'J', cost: 1 },
        { name: 'F', cost: 3 },
        { name: 'R', cost: 4 }
      ]
    },
    E3: {
      isEntrance: true,
      measure: {
        left: 672,
        top: 492,
        width: 50,
        height: 50
      },
      relations: [
        { name: 'E1', cost: 5 },
        { name: 'E2', cost: 4 },
        { name: 'A', cost: 1 },
        { name: 'P', cost: 3 },
        { name: 'R', cost: 2 }
      ]
    },
    A: {
      measure: {
        width: 110,
        height: 62,
        left: 563,
        top: 336
      },
      relations: [
        { name: 'E3', cost: 2 },
        { name: 'B', cost: 1 },
        { name: 'D', cost: 3 },
        { name: 'P', cost: 4 }
      ]
    },
    B: {
      measure: {
        left: 467,
        top: 220,
        width: 64,
        height: 208
      },
      relations: [
        { name: 'A', cost: 2 },
        { name: 'C', cost: 1 },
        { name: 'D', cost: 4 },
        { name: 'F', cost: 5 },
        { name: 'R', cost: 3 }
      ]
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
      relations: [
        { name: 'B', cost: 1 },
        { name: 'F', cost: 2 },
        { name: 'R', cost: 3 }
      ]
    },
    D: {
      measure: {
        left: 347,
        top: 125,
        width: 242,
        height: 62
      },
      relations: [
        { name: 'A', cost: 1 },
        { name: 'B', cost: 3 },
        { name: 'E', cost: 2 },
        { name: 'F', cost: 6 },
        { name: 'K', cost: 4 },
        { name: 'L', cost: 8 },
        { name: 'O', cost: 5 },
        { name: 'P', cost: 7 }
      ]
    },
    E: {
      measure: {
        width: 117,
        height: 105,
        left: 168,
        top: 83
      },
      relations: [
        { name: 'D', cost: 3 },
        { name: 'F', cost: 5 },
        { name: 'G', cost: 7 },
        { name: 'H', cost: 1 },
        { name: 'I', cost: 4 },
        { name: 'K', cost: 6 },
        { name: 'L', cost: 2 }
      ]
    },
    F: {
      measure: {
        left: 275,
        top: 208,
        width: 46,
        height: 209
      },
      relations: [
        { name: 'B', cost: 3 },
        { name: 'C', cost: 4 },
        { name: 'D', cost: 5 },
        { name: 'E', cost: 2 },
        { name: 'G', cost: 1 },
        { name: 'J', cost: 6 }
      ]
    },
    G: {
      measure: {
        left: 204,
        top: 210,
        width: 27,
        height: 90
      },
      relations: [
        { name: 'E', cost: 1 },
        { name: 'F', cost: 4 },
        { name: 'H', cost: 3 },
        { name: 'J', cost: 2 }
      ]
    },
    H: {
      measure: {
        left: 148,
        top: 225,
        width: 20,
        height: 59
      },
      relations: [
        { name: 'E', cost: 1 },
        { name: 'G', cost: 4 },
        { name: 'I', cost: 2 },
        { name: 'J', cost: 3 }
      ]
    },
    I: {
      measure: {
        left: 60,
        top: 127,
        width: 50,
        transform: 'rotate(15deg)',
        height: 23
      },
      relations: [
        { name: 'E1', cost: 3 },
        { name: 'E', cost: 5 },
        { name: 'H', cost: 6 }
      ]
    },
    J: {
      measure: {
        top: 326,
        left: 150,
        width: 70,
        height: 143
      },
      relations: [
        { name: 'E1', cost: 2 },
        { name: 'E2', cost: 1 },
        { name: 'F', cost: 10 },
        { name: 'G', cost: 4 },
        { name: 'H', cost: 7 }
      ]
    },
    K: {
      measure: {
        top: 81,
        left: 297,
        width: 14,
        height: 18
      },
      relations: [
        { name: 'D', cost: 5 },
        { name: 'E', cost: 10 },
        { name: 'F', cost: 1 },
        { name: 'L', cost: 6 }
      ]
    },
    L: {
      measure: {
        top: 32,
        left: 333,
        width: 116,
        height: 67
      },
      relations: [
        { name: 'D', cost: 1 },
        { name: 'E', cost: 5 },
        { name: 'K', cost: 10 },
        { name: 'O', cost: 2 }
      ]
    },
    O: {
      measure: {
        left: 472,
        top: 73,
        width: 59,
        height: 22
      },
      relations: [
        { name: 'D', cost: 10 },
        { name: 'L', cost: 3 },
        { name: 'P', cost: 2 }
      ]
    },
    P: {
      measure: {
        top: 74,
        left: 570,
        width: 31,
        height: 22
      },
      relations: [
        { name: 'E3', cost: 2 },
        { name: 'A', cost: 7 },
        { name: 'D', cost: 9 },
        { name: 'O', cost: 1 }
      ]
    },
    R: {
      measure: {
        top: 459,
        left: 467,
        width: 27,
        height: 35
      },
      relations: [
        { name: 'E2', cost: 1 },
        { name: 'E3', cost: 10 },
        { name: 'A', cost: 3 },
        { name: 'B', cost: 7 },
        { name: 'C', cost: 5 }
      ]
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
      const found = _
        .map(this.currentNode.relations, (r, k) => r.name)
        .filter(relation => relation == key).length
      if (!!found) {
        return { ...node, collides: true }
      } else {
        return { ...node, collides: false }
      }
    })
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
    this.initSearch()
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
      _.difference(
        _.map(this.nodes[node].relations, (r, k) => r.name),
        this.stack
      ),
      this.visited
    )
    this.stack = [...this.stack, ...relations]
    const popped = this.stack.pop()
    this.DFS(popped, finish)
  }

  @action
  initBestFirst = (start, finish) => {
    this.initSearch()
    this.bestFirst(start, finish)
  }

  @action
  initBestFirst2 = (start, finish) => {
    this.initSearch()
    this.bestFirst2(start, finish)
  }

  @action
  bestFirst = (start, finish) => {
    if (this.found) return
    if (this.nodes[start] == null) return
    if (!!this.nodes[start].visited) return
    this.setVisited(start)
    if (start == finish) {
      this.found = true
      return alert(`Encontrado ${start}`)
    }
    const relations = this.nodes[start].relations
    const finishNode = this.nodes[finish]
    const finishCoords = {
      x: finishNode.measure.left,
      y: finishNode.measure.top
    }
    const withDistance = relations.map(relation => {
      const relationNode = this.nodes[relation.name]
      console.log({ relationNode, finishNode })
      const relationCoords = {
        x: relationNode.measure.left,
        y: relationNode.measure.top
      }
      return {
        index: relation.name,
        distance: getDistance(relationCoords, finishCoords)
      }
    })

    const nearest = withDistance.reduce((prev, current) => {
      if (prev.distance > current.distance) return current
      return prev
    })

    console.log(start, { withDistance, nearest })

    this.bestFirst(nearest.index, finish)
  }

  @action
  bestFirst2 = (start, finish) => {
    if (this.found) return
    if (this.nodes[start] == null) return
    if (!!this.nodes[start].visited) return
    this.setVisited(start)
    if (start == finish) {
      this.found = true
      return alert(`Encontrado ${start}`)
    }
    const relations = this.nodes[start].relations.filter(relation => {
      return !this.nodes[relation.name].visited
    })
    const finishNode = this.nodes[finish]
    const finishCoords = {
      x: finishNode.measure.width,
      y: finishNode.measure.height
    }
    const withArea = relations.map(relation => {
      const relationNode = this.nodes[relation.name]
      console.log({ relationNode, finishNode })
      return {
        index: relation.name,
        area: getArea(relationNode.measure.width, relationNode.measure.height)
      }
    })

    const nearest = withArea.reduce(
      (prev, current) => {
        if (prev.area < current.area) return current
        return prev
      },
      {
        area: 0
      }
    )

    console.log(start, { withArea, nearest })

    this.bestFirst2(nearest.index, finish)
  }

  @action
  initMountainPath = (start, finish) => {
    this.initSearch()
    this.mountainPath(start, finish)
  }

  @action
  mountainPath = (start, finish) => {
    if (this.found) return
    if (this.nodes[start] == null) return
    if (!!this.nodes[start].visited) return
    this.setVisited(start)
    if (start == finish) {
      this.found = true
      return alert(`Encontrado ${start}`)
    }
    const startNode = this.nodes[start]
    const relations = startNode.relations
    const startCoords = {
      x: startNode.measure.left,
      y: startNode.measure.top
    }
    const withDistance = relations.map(relation => {
      const relationNode = this.nodes[relation.name]
      console.log({ relationNode, startNode })
      const relationCoords = {
        x: relationNode.measure.left,
        y: relationNode.measure.top
      }
      return {
        visited: relationNode.visited,
        index: relation.name,
        distance: getDistance(startCoords, relationCoords)
      }
    })

    const nearest = withDistance.filter(r => !r.visited).reduce(
      (prev, current) => {
        if (prev.distance > current.distance) return current
        return prev
      },
      {
        distance: 99999999
      }
    )

    console.log(start, { withDistance, nearest })

    this.mountainPath(nearest.index, finish)
  }

  @action
  initAStar = (start, finish) => {
    this.initSearch()
    this.aStar(start, finish)
  }

  @action
  aStar = (start, finish) => {
    if (this.found) return
    if (this.nodes[start] == null) return
    if (!!this.nodes[start].visited) return
    this.setVisited(start)
    if (start == finish) {
      this.found = true
      return alert(`Encontrado ${start}`)
    }
    const startNode = this.nodes[start]
    const relations = startNode.relations
    const startCoords = {
      x: startNode.measure.left,
      y: startNode.measure.top
    }

    const finishNode = this.nodes[finish]
    const finishCoords = {
      x: finishNode.measure.left,
      y: finishNode.measure.top
    }

    const withDistance = relations.map(relation => {
      const relationNode = this.nodes[relation.name]
      console.log({ relationNode, startNode })
      const relationCoords = {
        x: relationNode.measure.left,
        y: relationNode.measure.top
      }

      const distanceToFinish = getDistance(relationCoords, finishCoords)
      const distanceFromStart = getDistance(startCoords, relationCoords)

      const distance = distanceToFinish + distanceFromStart

      return {
        visited: relationNode.visited,
        index: relation.name,
        distance
      }
    })

    const nearest = withDistance
      .filter(r => !r.visited)
      .reduce((prev, current) => {
        if (prev.distance > current.distance) return current
        return prev
      })

    console.log(start, { withDistance, nearest })

    this.aStar(nearest.index, finish)
  }

  @action
  initBFS = (start, finish) => {
    this.initSearch()
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
      return alert(`Encontrado ${node}`)
    }
    const relations = _.difference(
      _.difference(_.map(this.nodes[node].relations, r => r.name), this.stack),
      this.visited
    )
    this.stack = [...this.stack, ...relations]
    const shifted = this.stack.shift()
    this.BFS(shifted, finish)
  }

  @action
  initIDS = (start, finish) => {
    this.initSearch()
    this.stack.push(start)
    this.setDepthToNodes(this.stack)
    this.iterations = this.iterations + 1
    const popped = this.stack.pop()
    this.IDS(popped, finish)
  }

  @action
  IDS = (node, finish) => {
    console.log('IDS', node)
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
      _.difference(
        _.map(this.nodes[node].relations, (r, k) => r.name),
        this.stack
      ),
      this.visited
    )

    this.setDepthToNodes(relations)
    this.stack = [...this.stack, ...relations]

    if (!this.nodes[node].depth) {
      this.iterations = this.iterations + 1
    }

    const popped = this.stack.pop()
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
  initUCS = (start, finish) => {
    this.initSearch()
    this.stack.push(start)
    const shifted = this.stack.shift()
    this.UCS(shifted, finish)
  }

  @action
  UCS = (node, finish) => {
    if (this.found) return
    if (this.nodes[node] == null) return
    if (!!this.nodes[node].visited) return
    this.setVisited(node)
    if (node == finish) {
      this.found = true
      return alert(`Encontrado ${node}`)
    }
    const relations = _.difference(
      _.difference(
        _.map(
          _.sortBy(this.nodes[node].relations, r => r.cost),
          (r, k) => r.name
        ),
        this.stack
      ),
      this.visited
    )

    this.stack = [...this.stack, ...relations]
    const shifted = this.stack.shift()
    this.UCS(shifted, finish)
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
  initSearch = () => {
    const cleared = _.mapValues(this.nodes, (node, key) => {
      return { ...node, visited: false, searchIndex: '', depth: 0 }
    })
    this.nodes = cleared
    this.queue = []
    this.stack = []
    this.visited = []
    this.found = false
    this.iterations = 0

    this.nodes = { ...this.nodes }
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
  state = { depthColors: [] }
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
    this.setState(
      prevState => ({
        depthColors: new Array(level)
      }),
      () => {
        this.state.depthColors.map(() => getRandomColor())
        this.setState()
      }
    )
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
  handleUCSClick = () => {
    if (!this.to || !this.from) {
      alert('Selecciona de donde a donde quieres ir.')
    } else {
      const search = this.graph.initUCS(this.from, this.to)
      console.log({ search })
    }
  }

  handleBestFirstClick = () => {
    if (!this.to || !this.from) {
      alert('Selecciona de donde a donde quieres ir.')
    } else {
      const search = this.graph.initBestFirst(this.from, this.to)
      console.log({ search })
    }
  }
  handleBestFirst2Click = () => {
    if (!this.to || !this.from) {
      alert('Selecciona de donde a donde quieres ir.')
    } else {
      const search = this.graph.initBestFirst2(this.from, this.to)
      console.log({ search })
    }
  }
  handleMountainPath = () => {
    if (!this.to || !this.from) {
      alert('Selecciona de donde a donde quieres ir.')
    } else {
      const search = this.graph.initMountainPath(this.from, this.to)
      console.log({ search })
    }
  }

  handleAStar = () => {
    if (!this.to || !this.from) {
      alert('Selecciona de donde a donde quieres ir.')
    } else {
      const search = this.graph.initAStar(this.from, this.to)
      console.log({ search })
    }
  }

  render() {
    const { depthColors } = this.state
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
                  {!!node.depth && <DepthLevel>{node.depth}</DepthLevel>}
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
            <Button onClick={this.handleUCSClick}>
              Busqueda por costo uniforme
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
          <Row>
            <Button onClick={this.handleBestFirstClick}>
              Busqueda primero el mejor (Distancia)
            </Button>
            <Button onClick={this.handleBestFirst2Click}>
              Busqueda primero el mejor (Sombra)
            </Button>
            <Button onClick={this.handleMountainPath}>Montaña</Button>
            <Button onClick={this.handleAStar}>A*</Button>
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

const DepthLevel = styled.div`
  position: absolute;
  background: red;
  color: black;
  bottom: 0;
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
