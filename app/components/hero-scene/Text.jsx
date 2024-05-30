// 3D
import { useThree } from "@react-three/fiber";
import { Center, Text3D, useMatcapTexture } from "@react-three/drei";

const Text = () => {
  const [matcapTexture] = useMatcapTexture("CB4E88_F99AD6_F384C3_ED75B9");
  const viewport = useThree((state) => state.viewport);

  return (
    <group>
      <Center scale={[-0.5, 0.5, 1]}>
        <Text3D
          position={[0, 0, -10]}
          scale={[-1, 1, 1]}
          size={viewport.width / 9}
          font={"/gt.json"}
          curveSegments={24}
          bevelSegments={1}
          bevelEnabled
          bevelSize={0.08}
          bevelThickness={0.03}
          height={1}
          lineHeight={0.9}
          letterSpacing={0.3}
        >
          {`MONOGRID`}
          <meshMatcapMaterial color="white" matcap={matcapTexture} />
        </Text3D>
      </Center>
    </group>
  );
}

export default Text;