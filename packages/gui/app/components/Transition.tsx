// based on https://gist.github.com/adamwathan/3b9f3ad1a285a2d1b482769aeb862467#gistcomment-3267666

import {createContext, useContext, useEffect, useRef} from 'react'
import {CSSTransition as ReactCSSTransition} from 'react-transition-group'

type TransitionContextProps = {
  parent: {
    show: boolean
    isInitialRender: boolean
    appear?: boolean
  }
}

const TransitionContext = createContext<Partial<TransitionContextProps>>({
  parent: {
    show: false,
    isInitialRender: true,
  },
})

const useIsInitialRender = () => {
  const isInitialRender = useRef(true)

  useEffect(() => {
    isInitialRender.current = false
  }, [])

  return isInitialRender.current
}

interface TransitionProps {
  show: boolean
  enter?: string
  enterFrom?: string
  enterTo?: string
  leave?: string
  leaveFrom?: string
  leaveTo?: string
  appear?: boolean
  children: React.ReactNode
}

type CSSTransitionProps = TransitionProps

const CSSTransition = ({
  show,
  enter = '',
  enterFrom = '',
  enterTo = '',
  leave = '',
  leaveFrom = '',
  leaveTo = '',
  appear,
  children,
}: CSSTransitionProps) => {
  const enterClasses = enter.split(' ').filter((s) => s.length)
  const enterFromClasses = enterFrom.split(' ').filter((s) => s.length)
  const enterToClasses = enterTo.split(' ').filter((s) => s.length)
  const leaveClasses = leave.split(' ').filter((s) => s.length)
  const leaveFromClasses = leaveFrom.split(' ').filter((s) => s.length)
  const leaveToClasses = leaveTo.split(' ').filter((s) => s.length)

  const addClasses = (node: HTMLElement, classes: string[]) => {
    classes.length && node.classList.add(...classes)
  }

  const removeClasses = (node: HTMLElement, classes: string[]) => {
    classes.length && node.classList.remove(...classes)
  }

  return (
    <ReactCSSTransition
      appear={appear}
      unmountOnExit
      in={show}
      addEndListener={(node, done) => {
        node.addEventListener('transitionend', done, false)
      }}
      onEnter={(node: HTMLElement) => {
        addClasses(node, [...enterClasses, ...enterFromClasses])
      }}
      onEntering={(node: HTMLElement) => {
        removeClasses(node, enterFromClasses)
        addClasses(node, enterToClasses)
      }}
      onEntered={(node: HTMLElement) => {
        removeClasses(node, [...enterToClasses, ...enterClasses])
      }}
      onExit={(node: HTMLElement) => {
        addClasses(node, [...leaveClasses, ...leaveFromClasses])
      }}
      onExiting={(node: HTMLElement) => {
        removeClasses(node, leaveFromClasses)
        addClasses(node, leaveToClasses)
      }}
      onExited={(node: HTMLElement) => {
        removeClasses(node, [...leaveToClasses, ...leaveClasses])
      }}>
      {children}
    </ReactCSSTransition>
  )
}

export const Transition = ({show, appear, ...rest}: TransitionProps) => {
  const {parent} = useContext(TransitionContext)
  const isInitialRender = useIsInitialRender()
  const isChild = show === undefined

  if (isChild) {
    return (
      <CSSTransition
        appear={parent ? parent.appear || !parent.isInitialRender : false}
        show={parent?.show ? parent.show : false}
        {...rest}
      />
    )
  }

  return (
    <TransitionContext.Provider
      value={{
        parent: {
          show,
          isInitialRender,
          appear,
        },
      }}>
      <CSSTransition appear={appear} show={show} {...rest} />
    </TransitionContext.Provider>
  )
}
