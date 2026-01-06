export default function TokenInfo(props: { jwt: string | undefined }) {
  const { jwt } = props
  if (!jwt) {
    return <p className="bg-gray-200 p-3 rounded font-mono text-xs break-all">N/A</p>
  }
  return (
    <>
      <p className="bg-gray-200 p-3 rounded font-mono text-xs break-all">{jwt}</p>
      <p className="text-right">
        <a href={`https://jwt.io/#token=${jwt}`} target="_blank">
          jwt.io
        </a>
      </p>
    </>
  )
}
