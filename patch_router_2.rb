content = File.read('/Users/homer/Projects/MirrorNeuron/lib/mirror_neuron/api/router.ex')
content.sub!(/manifest ->\n\s*case MirrorNeuron.run_manifest\(manifest\) do/, <<~ELIXIR)
      manifest ->
        input = if manifest["_bundle_path"], do: manifest["_bundle_path"], else: manifest
        case MirrorNeuron.run_manifest(input) do
ELIXIR

File.write('/Users/homer/Projects/MirrorNeuron/lib/mirror_neuron/api/router.ex', content)
