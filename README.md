# kutt-to-snapp

Migrate short URLs from [kutt](https://kutt.it) to [snapp](https://snapp.li/).

## Usage

```shell
KUTT_URL=https://kutt.it \
KUTT_TOKEN=your-kutt-token \
MIGRATE_ALL=true \
npx kutt-to-snapp > kutt.csv
```

`kutt-to-snapp` will output the CSV file to stdout.

`KUTT_URL` and `KUTT_TOKEN` are required.

`KUTT_TOKEN` can generate in settings page.

![settings page](./doc/kutt-generate-key.png)

`MIGRATE_ALL` is optional. default value is `false`. If set to `true`, it will read all short URLs from kutt. Only you are the administrator of kutt.

## License

MIT.
