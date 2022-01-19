echo "Sleeping to give container a chance to boot 😴"
sleep 20
RESPONSE_SHA="null"
MAX_ATTEMPTS="20"
i=0
while [ "$RESPONSE_SHA" != "$SHA" ] && [[ "$i" -lt "$MAX_ATTEMPTS" ]]; do
    sleep 10
    RESPONSE_SHA=$(curl -s $HEALTHCHECK_URL | jq -r .SHA)
    i=$((i+1))
    echo "attempt $i: $RESPONSE_SHA == $SHA"
done

if [[ "$i" -eq "$MAX_ATTEMPTS" ]]; then
    echo "Fail: Could not complete healthcheck"
    exit 1
fi

echo "Success: SHA recieved - ${SHA}"