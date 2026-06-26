pushd $(dirname $0)

port=5008

# Clean up old image
podman stop -i epic_music_web
podman rm -i epic_music_web

# Build latest image and run container
podman build . -t epic_music_web:latest --env PORT=$port
podman image prune -f

podman run \
    --name epic_music_web \
    -i \
    -t \
    -p $port:$port \
    -m 2500m \
    --memory-reservation 4g \
    epic_music_web:latest

popd