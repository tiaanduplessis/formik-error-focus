import { Component } from 'react'
import { connect } from 'formik'
import scrollToElement from 'scroll-to-element'

// Based on this gist: https://gist.github.com/dphrag/4db3b453e02567a0bb52592679554a5b
class ErrorFocus extends Component {
  static defaultProps = {
    offset: 0,
    align: 'top',
    focusDelay: 200,
    ease: 'linear',
    duration: 1000
  }

  componentDidUpdate (prevProps) {
    const { isSubmitting, isValidating, errors } = prevProps.formik
    const keys = Object.keys(errors)

    if (keys.length > 0 && isSubmitting && !isValidating) {
      const selector = `[name="${keys[0]}"]`
      const errorElement = document.querySelector(selector)

      if (errorElement) {
        const { offset, ease, duration, focusDelay, align } = this.props
        scrollToElement(errorElement, {
          offset, ease, duration, align
        })

        this.timeout = setTimeout(() => errorElement.focus(), duration + focusDelay)
      }
    }
  }

  componentWillUnmount () {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
  }

  render () {
    return null
  }
}

export default connect(ErrorFocus)
