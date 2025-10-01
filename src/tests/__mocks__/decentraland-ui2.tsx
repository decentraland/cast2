/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'

const Button = ({ children, onClick, disabled, startIcon, ...props }: any) => (
  <button onClick={onClick} disabled={disabled} {...props}>
    {startIcon}
    {children}
  </button>
)

const Typography = ({ children, ...props }: any) => <span {...props}>{children}</span>

const Card = ({ children, ...props }: any) => <div {...props}>{children}</div>

const Navbar = ({ children, ...props }: any) => <nav {...props}>{children}</nav>

const NavbarPages = {
  EXTRA: 'extra'
}

const FormControl = ({ children, ...props }: any) => <div {...props}>{children}</div>

const InputLabel = ({ children, ...props }: any) => <label {...props}>{children}</label>

const Select = ({ children, value, onChange, ...props }: any) => (
  <select value={value} onChange={onChange} {...props}>
    {children}
  </select>
)

const MenuItem = ({ children, value, ...props }: any) => (
  <option value={value} {...props}>
    {children}
  </option>
)

const Input = ({ ...props }: any) => <input {...props} />

export { Button, Card, FormControl, Input, InputLabel, MenuItem, Navbar, NavbarPages, Select, Typography }
