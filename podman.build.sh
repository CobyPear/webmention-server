VERSION=$(podman image ls --format '{{.Tag}}' localhost/webmentions | grep -v latest | sort -r | head -n 1)

if [ "$1" == "PATCH" ]; then
  # Increment patch version (e.g., 0.3.2)
  VERSION=$(echo $VERSION | awk -F. '{$3++; print}' OFS=.)
elif [ "$1" == "MINOR" ]; then
  # Increment minor version and reset patch version (e.g., 0.4.0)
  VERSION=$(echo $VERSION | awk -F. '{$2++; $3=0; print}' OFS=.)
elif [ "$1" == "MAJOR" ]; then
  # Increment major version and reset minor and patch versions (e.g., 1.0.0)
  VERSION=$(echo $VERSION | awk -F. '{$1++; $2=0; $3=0; print}' OFS=.)
else
  # Invalid argument, exit with error
  echo "Invalid argument. Usage: ./increment_version.sh [PATCH|MINOR|MAJOR]"
  exit 1
fi

podman build \
  --tag=webmentions:latest \
  --tag=webmentions:$VERSION .

