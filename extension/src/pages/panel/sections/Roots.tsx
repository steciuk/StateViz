import { Library } from '@src/shared/types/Library'
import { ParsedReactNode, ParsedSvelteNode, Root } from '@src/shared/types/ParsedNode'
import React from 'react'
import { Row } from '@pages/panel/components/Row/Row'



const Roots = (props: {roots: Root[]}) => {
  return (
    props.roots.map((root) => (
      <div key={root.node.id}>
      <p>{root.library}</p>
      <Row nodeAndLibrary={root} indent={0} />
      </div>
    ))
  )
}

export default Roots