export default function TokenInfo(props: { jwt: string | undefined }) {
  const { jwt } = props
  if (!jwt) {
    return <p className="token">N/A</p>
  }
  return (
    <>
      <p className="token">{jwt}</p>
      <p className="jwt-io">
        <a href={`https://jwt.io/#token=${jwt}`} target="_blank">
          jwt.io
        </a>
      </p>
    </>
  )
}
