import React, { Component } from 'react';
import { compose } from 'recompose';

import { defaultProps } from '../../default-props';
import { Box } from '../Box';
import { Keyboard } from '../Keyboard';
import { RadioButton } from '../RadioButton';
import { withForwardRef } from '../hocs';

class RadioButtonGroup extends Component {
  static getDerivedStateFromProps(nextProps) {
    const { options, value } = nextProps;
    return {
      options: options.map(o =>
        typeof o === 'string' ? { id: o, label: o, value: o } : o,
      ),
      value,
    };
  }

  state = {};

  optionRefs = [];

  componentDidUpdate(prevProps, prevState) {
    const { focus, options, value } = this.state;
    if (
      focus &&
      value &&
      (prevState.value !== value || prevState.focus !== focus)
    ) {
      const valueIndex = this.valueIndex(options, value);
      this.optionRefs[valueIndex].focus();
    }
  }

  valueIndex = (options, value) => {
    let result;
    options.some((option, index) => {
      if (option.value === value) {
        result = index;
        return true;
      }
      return false;
    });
    return result;
  };

  onNext = () => {
    const { onChange } = this.props;
    const { options, value } = this.state;
    const valueIndex = this.valueIndex(options, value);
    if (valueIndex !== undefined && valueIndex < options.length - 1) {
      const nextIndex = valueIndex + 1;
      const nextValue = options[nextIndex].value;
      this.setState({ value: nextValue }, () => {
        this.optionRefs[nextIndex].focus();
      });
      if (onChange) {
        onChange({ target: { value: nextValue } });
      }
    }
  };

  onPrevious = () => {
    const { onChange } = this.props;
    const { options, value } = this.state;
    const valueIndex = this.valueIndex(options, value);
    if (valueIndex > 0) {
      const nextIndex = valueIndex - 1;
      const nextValue = options[nextIndex].value;
      this.setState({ value: nextValue }, () => {
        this.optionRefs[nextIndex].focus();
      });
      if (onChange) {
        onChange({ target: { value: nextValue } });
      }
    }
  };

  onFocus = () => {
    // Delay just a wee bit so Chrome doesn't missing turning the button on.
    // Chrome behaves differently in that focus is given to radio buttons
    // when the user selects one, unlike Safari and Firefox.
    setTimeout(() => {
      this.setState(state => {
        if (!state.focus) {
          return { focus: true };
        }
        return null;
      });
    }, 1);
  };

  onBlur = () => {
    this.setState(state => {
      if (state.focus) {
        return { focus: false };
      }
      return null;
    });
  };

  render() {
    const { forwardRef, name, onChange, ...rest } = this.props;
    const { focus, options, value: selectedValue } = this.state;
    return (
      <Keyboard
        target="document"
        onUp={focus ? this.onPrevious : undefined}
        onDown={focus ? this.onNext : undefined}
        onLeft={focus ? this.onPrevious : undefined}
        onRight={focus ? this.onNext : undefined}
      >
        <Box ref={forwardRef} gap="small" {...rest}>
          {options.map(({ disabled, id, label, value }, index) => (
            <RadioButton
              ref={ref => {
                this.optionRefs[index] = ref;
              }}
              key={value}
              name={name}
              label={label}
              disabled={disabled}
              checked={value === selectedValue}
              focus={
                focus &&
                (value === selectedValue ||
                  (selectedValue === undefined && !index))
              }
              id={id}
              value={value}
              onChange={onChange}
              onFocus={this.onFocus}
              onBlur={this.onBlur}
            />
          ))}
        </Box>
      </Keyboard>
    );
  }
}

RadioButtonGroup.defaultProps = {};
Object.setPrototypeOf(RadioButtonGroup.defaultProps, defaultProps);

let RadioButtonGroupDoc;
if (process.env.NODE_ENV !== 'production') {
  RadioButtonGroupDoc = require('./doc').doc(RadioButtonGroup); // eslint-disable-line global-require
}
const RadioButtonGroupWrapper = compose(withForwardRef)(
  RadioButtonGroupDoc || RadioButtonGroup,
);

export { RadioButtonGroupWrapper as RadioButtonGroup };
