import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
} from "@angular/core";
import {
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from "@angular/forms";

import {
    AddressFragment,
    CountryFragment,
    OrderAddressFragment,
} from "../../../common/generated-types";
import {
    DataService,
    District,
    Upazilla,
} from "../../../core/providers/data/data.service";
import { take, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";

@Component({
    selector: "vsf-address-form",
    templateUrl: "./address-form.component.html",
    // styleUrls: ['./address-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressFormComponent implements OnInit, OnChanges, OnDestroy {
    @Input() availableCountries: CountryFragment[];
    @Input() address: OrderAddressFragment | AddressFragment;

    addressForm: UntypedFormGroup;
    districts: District[] = [];
    upazilas: Upazilla[] = [];
    filteredUpazilaByDistrict: Upazilla[] = [];

    private destroy$: Subject<string> = new Subject<string>();

    constructor(
        private formBuilder: UntypedFormBuilder,
        private dataService: DataService,
    ) {
        this.addressForm = this.formBuilder.group({
            streetLine1: ["", Validators.required],
            streetLine2: "",
            city: ["", Validators.required],
            province: "",
            postalCode: ["", Validators.required],
            phoneNumber: "",
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if ("address" in changes && this.addressForm && this.address) {
            this.addressForm.patchValue(this.address, {});
        }
        //const country = this.address && this.address.country;
        //if (country && this.availableCountries) {
        //if (country && typeof country !== 'string') {
        //this.addressForm.patchValue({
        //countryCode: country.code,
        //});
        // } else {
        //const matchingCountry = this.availableCountries.find(c => c.name === country);
        //if (matchingCountry) {
        // this.addressForm.patchValue({
        //   countryCode: matchingCountry.code,
        // });
        // }
        //}
        //}
    }

    ngOnInit(): void {
        this.addressForm
            .get("city")
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((districtId) => {
                const selectedDistrict = this.districts.find(
                    (district) => district.id === districtId,
                );
                if (selectedDistrict) {
                    this.filteredUpazilaByDistrict = this.upazilas
                        .filter((up) => up.district_id === districtId)
                        .sort((a, b) => a.name.localeCompare(b.name));
                }
            });
        this.dataService
            .getDistricts()
            .pipe(take(1))
            .subscribe((data) => {
                this.districts = data.sort((a, b) =>
                    a.name.localeCompare(b.name),
                );
                console.log("Districts", data);
            });

        this.dataService
            .getUpazillas()
            .pipe(take(1))
            .subscribe((data) => {
                this.upazilas = data;
                console.log("Upazillas", data);
            });

        /*this.dataService.getUnions()
            .pipe(take(1))
            .subscribe(data => {
                console.log('Unions', data);
            });*/
    }

    ngOnDestroy() {
        this.destroy$.next("");
        this.destroy$.complete();
    }
}
